/**
 * lib/andreani.ts
 * Cliente para la integración con Andreani (API v2)
 */

const BASE_URL = process.env.ANDREANI_BASE_URL || 'https://apisqa.andreani.com';
const USUARIO = process.env.ANDREANI_USUARIO;
const PASSWORD = process.env.ANDREANI_PASSWORD;
const CLIENTE = process.env.ANDREANI_CLIENTE;

export interface AndreaniCotizacion {
  tarifa: number;
  diasEntrega: string;
  tipo: 'domicilio' | 'sucursal';
}

/**
 * Obtiene el token de autenticación (Bearer)
 */
async function getToken(): Promise<string> {
  if (!USUARIO || !PASSWORD) {
    throw new Error('Credenciales de Andreani no configuradas');
  }

  const response = await fetch(`${BASE_URL}/login`, {
    method: 'GET', // Algunas versiones de la v2 usan GET para login con Basic Auth
    headers: {
      'Authorization': `Basic ${Buffer.from(`${USUARIO}:${PASSWORD}`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error de autenticación Andreani: ${error}`);
  }

  // El token suele venir en el header o body dependiendo de la versión
  const token = response.headers.get('x-authorization-token');
  if (token) return token;

  const body = await response.json();
  return body.token || body.accessToken;
}

/**
 * Cotiza el envío basándose en el CP y el peso
 */
export async function cotizarEnvio(
  cpDestino: string,
  pesoGramos: number,
  valorDeclarado: number = 0
): Promise<AndreaniCotizacion[]> {
  const token = await getToken();
  
  // Contratos definidos en .env
  const contratoDomicilio = process.env.ANDREANI_CONTRATO_DOMICILIO;
  const contratoSucursal = process.env.ANDREANI_CONTRATO_SUCURSAL;

  const queryParams = new URLSearchParams({
    cpDestino,
    cliente: CLIENTE || '',
    bultos: JSON.stringify([{
      peso: pesoGramos,
      valorDeclarado: valorDeclarado || 1000, // Valor mínimo para seguro
    }]),
  });

  const fetchTarifa = async (contrato: string | undefined, tipo: 'domicilio' | 'sucursal') => {
    if (!contrato) return null;
    try {
      const res = await fetch(`${BASE_URL}/v2/tarifas?${queryParams}&contrato=${contrato}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        tarifa: data.tarifaConIva || data.tarifa,
        diasEntrega: data.diasEntrega || '3-5',
        tipo,
      };
    } catch {
      return null;
    }
  };

  const resultados = await Promise.all([
    fetchTarifa(contratoDomicilio, 'domicilio'),
    fetchTarifa(contratoSucursal, 'sucursal'),
  ]);

  return resultados.filter(Boolean) as AndreaniCotizacion[];
}

/**
 * Crea la orden de envío definitiva en Andreani
 */
export async function crearOrdenEnvio(datos: any) {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/v2/ordenes-de-envio`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al crear orden en Andreani: ${error}`);
  }

  return await response.json();
}

/**
 * Obtiene el link PDF de la etiqueta
 */
export async function obtenerEtiqueta(numeroEnvio: string): Promise<string> {
  const token = await getToken();
  
  const response = await fetch(`${BASE_URL}/v2/ordenes-de-envio/${numeroEnvio}/etiquetas`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) return '';
  
  const data = await response.json();
  return data.url || data.etiquetaPdf || '';
}

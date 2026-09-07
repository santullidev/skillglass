/**
 * lib/andreani.ts
 * Cliente para la integración con Andreani.
 *
 * Endpoints (verificados contra apis.andreani.com y apisqa.andreani.com):
 *  - GET  /v1/tarifas                          → cotización. PÚBLICO, no requiere token.
 *  - GET  /login                               → Basic Auth, devuelve header x-authorization-token.
 *  - POST /v2/ordenes-de-envio                 → alta de orden. Autenticado.
 *  - GET  /v2/ordenes-de-envio/{nro}/etiquetas → PDF de etiqueta. Autenticado.
 *  - GET  /v2/sucursales                       → listado de sucursales. PÚBLICO.
 *
 * El token va en el header `x-authorization-token`, NO en `Authorization: Bearer`.
 */

const BASE_URL = process.env.ANDREANI_BASE_URL || 'https://apis.andreani.com'

/**
 * Host para las operaciones autenticadas (alta de orden y etiquetas).
 * Se separa del resto porque las credenciales de QA sólo sirven contra apisqa,
 * mientras que la cotización de tarifas sólo funciona con los contratos de
 * producción. Sin este split no se puede testear el alta sin romper el cotizador.
 */
const ORDENES_BASE_URL = process.env.ANDREANI_ORDENES_BASE_URL || BASE_URL

const USUARIO = process.env.ANDREANI_USUARIO
const PASSWORD = process.env.ANDREANI_PASSWORD
const CLIENTE = process.env.ANDREANI_CLIENTE

const CONTRATO_DOMICILIO = process.env.ANDREANI_CONTRATO_DOMICILIO
const CONTRATO_SUCURSAL = process.env.ANDREANI_CONTRATO_SUCURSAL

/** Volumen estimado del packaging por unidad, en cm³. Andreani afora por peso o volumen. */
const VOLUMEN_POR_ITEM_CM3 = Number(process.env.ANDREANI_VOLUMEN_ITEM_CM3 || 1000)
/** Peso por defecto de una pieza si el producto no lo define en Sanity, en gramos. */
const PESO_DEFAULT_GR = 300

export type TipoEnvio = 'domicilio' | 'sucursal'

export interface BultoInput {
  /** Peso en KILOS (la API no acepta gramos). */
  kilos: number
  /** Volumen en cm³. */
  volumenCm: number
  /** Valor declarado para el seguro. Andreani cobra 2% de este monto. */
  valorDeclarado: number
}

export interface AndreaniCotizacion {
  tipo: TipoEnvio
  contrato: string
  /** Total CON IVA, redondeado hacia arriba. */
  tarifa: number
  /** Desglose informativo. */
  distribucion: number
  seguro: number
  pesoAforado: number
}

export function contratoPara(tipo: TipoEnvio): string | undefined {
  return tipo === 'domicilio' ? CONTRATO_DOMICILIO : CONTRATO_SUCURSAL
}

/**
 * Arma el bulto único a despachar a partir de los items del carrito.
 * Se envía todo en un solo paquete: son piezas chicas de joyería.
 */
export function construirBulto(
  items: { peso?: number | null; cantidad?: number; precio?: number }[]
): BultoInput {
  let gramos = 0
  let unidades = 0
  let valor = 0

  for (const item of items) {
    const cantidad = Number(item.cantidad || 1)
    gramos += Number(item.peso || PESO_DEFAULT_GR) * cantidad
    unidades += cantidad
    valor += Number(item.precio || 0) * cantidad
  }

  return {
    kilos: Number((gramos / 1000).toFixed(3)),
    volumenCm: Math.max(unidades, 1) * VOLUMEN_POR_ITEM_CM3,
    valorDeclarado: Math.round(valor),
  }
}

// ─── AUTENTICACIÓN ────────────────────────────────────────────────────────────

/** El token de Andreani dura 24hs. Lo cacheamos para no pedir uno por request. */
let tokenCache: { token: string; expiraEn: number } | null = null

async function getToken(forzarRefresh = false): Promise<string> {
  if (!USUARIO || !PASSWORD) {
    throw new Error('Credenciales de Andreani no configuradas (ANDREANI_USUARIO / ANDREANI_PASSWORD)')
  }

  if (!forzarRefresh && tokenCache && Date.now() < tokenCache.expiraEn) {
    return tokenCache.token
  }

  const basic = Buffer.from(`${USUARIO}:${PASSWORD}`).toString('base64')
  const response = await fetch(`${ORDENES_BASE_URL}/login`, {
    headers: { Authorization: `Basic ${basic}` },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Error de autenticación Andreani (${response.status}): ${await response.text()}`)
  }

  // El token viene en el header; algunas versiones lo repiten en el body.
  const token =
    response.headers.get('x-authorization-token') ||
    (await response.json().then((b) => b?.token || b?.accessToken).catch(() => null))

  if (!token) throw new Error('Andreani no devolvió token de autenticación')

  // El JWT trae exp a 24hs; cacheamos 23 para tener margen.
  tokenCache = { token, expiraEn: Date.now() + 23 * 60 * 60 * 1000 }
  return token
}

/**
 * Ejecuta un request autenticado, renovando el token una vez si devuelve 401.
 *
 * ⚠️ Andreani NO usa `Authorization: Bearer`. El token va en su propio header
 * `x-authorization-token`; con Bearer la API responde 401 siempre.
 */
async function fetchConToken(url: string, init: RequestInit = {}): Promise<Response> {
  let token = await getToken()
  const call = () =>
    fetch(url, {
      ...init,
      headers: { ...init.headers, 'x-authorization-token': token },
      cache: 'no-store',
    })

  let res = await call()
  if (res.status === 401) {
    token = await getToken(true)
    res = await call()
  }
  return res
}

// ─── COTIZACIÓN ───────────────────────────────────────────────────────────────

/**
 * Cotiza el envío contra /v1/tarifas.
 *
 * Este endpoint es público: sólo necesita el número de contrato, no el token.
 * Los bultos van como query params indexados (bultos[0][kilos]), NO como JSON.
 */
export async function cotizarEnvio(
  cpDestino: string,
  bulto: BultoInput,
  tipos: TipoEnvio[] = ['domicilio', 'sucursal']
): Promise<AndreaniCotizacion[]> {
  const cotizarUna = async (tipo: TipoEnvio): Promise<AndreaniCotizacion | null> => {
    const contrato = contratoPara(tipo)
    if (!contrato) return null

    const params = new URLSearchParams({
      cpDestino,
      contrato,
      'bultos[0][kilos]': String(bulto.kilos),
      'bultos[0][volumen]': String(bulto.volumenCm),
      'bultos[0][valorDeclarado]': String(bulto.valorDeclarado),
    })
    if (CLIENTE) params.set('cliente', CLIENTE)

    const res = await fetch(`${BASE_URL}/v1/tarifas?${params}`, {
      // La tarifa cambia poco durante el día; cacheamos 1h para no pegarle en cada render.
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.warn(`Andreani /v1/tarifas ${tipo} → ${res.status}: ${await res.text()}`)
      return null
    }

    const data = await res.json()
    // tarifaConIva es un OBJETO {seguroDistribucion, distribucion, total}, no un número.
    const total = Number(data?.tarifaConIva?.total)
    if (!Number.isFinite(total)) {
      console.warn('Andreani devolvió una tarifa con formato inesperado:', JSON.stringify(data))
      return null
    }

    return {
      tipo,
      contrato,
      tarifa: Math.ceil(total),
      distribucion: Number(data?.tarifaConIva?.distribucion) || 0,
      seguro: Number(data?.tarifaConIva?.seguroDistribucion) || 0,
      pesoAforado: Number(data?.pesoAforado) || 0,
    }
  }

  const resultados = await Promise.all(tipos.map(cotizarUna))
  return resultados.filter((r): r is AndreaniCotizacion => r !== null)
}

// ─── SUCURSALES ───────────────────────────────────────────────────────────────

export interface Sucursal {
  id: number
  codigo: string
  nomenclatura?: string
  descripcion: string
  calle: string
  numero: string
  localidad: string
  provincia: string
  codigoPostal: string
  horario: string
}

interface SucursalApi {
  id: number
  codigo: string
  canal?: string
  nomenclatura?: string
  descripcion?: string
  direccion?: Record<string, string>
  horarioDeAtencion?: string
  codigosPostalesAtendidos?: (string | number)[]
}

/**
 * Sucursales que reciben paquetes de particulares para el CP indicado.
 * El endpoint es público y el listado completo pesa ~800KB, así que lo cacheamos 24hs.
 *
 * ⚠️ El listado mezcla cuatro canales y sólo B2C sirve como destino de un envío
 * a sucursal. Mandar una sucursal B2B, DMS o CDS en `destino.sucursal.id` hace
 * que el alta de la orden falle con "No se encontró la sucursal".
 * Los flags `entregaEnvios` / `seHaceAtencionAlCliente` NO alcanzan para
 * distinguirlas: hay sucursales B2C válidas con esos flags en false.
 */
export async function buscarSucursalesPorCP(cp: string): Promise<Sucursal[]> {
  const res = await fetch(`${BASE_URL}/v2/sucursales`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`Error al listar sucursales de Andreani: ${res.status}`)

  const todas: SucursalApi[] = await res.json()
  const cpNormalizado = cp.replace(/\D/g, '')

  const candidatas = todas.filter((s) => {
    const atiendeElCP = (s.codigosPostalesAtendidos || []).map(String).includes(cpNormalizado)
    const esUsable = !/NO USAR/i.test(s.descripcion || '')
    return atiendeElCP && s.canal === 'B2C' && esUsable
  })

  // El listado trae la misma sucursal repetida con datos ligeramente distintos.
  const vistas = new Set<string>()
  const sucursales: Sucursal[] = []

  for (const s of candidatas) {
    const dir = s.direccion || {}
    const clave = `${(s.descripcion || '').toLowerCase().trim()}|${dir.codigoPostal || ''}`
    if (vistas.has(clave)) continue
    vistas.add(clave)

    sucursales.push({
      id: s.id,
      codigo: s.codigo,
      nomenclatura: s.nomenclatura,
      descripcion: s.descripcion || s.codigo,
      calle: dir.calle || '',
      numero: dir.numero || '',
      localidad: dir.localidad || '',
      provincia: dir.provincia || '',
      codigoPostal: dir.codigoPostal || '',
      horario: s.horarioDeAtencion || '',
    })
  }

  return sucursales
}

// ─── ALTA DE ORDEN ────────────────────────────────────────────────────────────

export interface DestinatarioInput {
  nombreCompleto: string
  email: string
  telefono: string
  /** DNI del receptor. Andreani lo exige para entregas B2C. */
  documentoNumero: string
  documentoTipo?: string
}

export interface DestinoPostal {
  codigoPostal: string
  calle: string
  numero: string
  piso?: string
  departamento?: string
  localidad: string
  /** La API llama "region" a lo que nosotros llamamos provincia. */
  provincia: string
}

export interface CrearOrdenInput {
  tipoEnvio: TipoEnvio
  idPedido: string
  destinatario: DestinatarioInput
  bulto: BultoInput
  /** Para envío a domicilio. */
  destinoPostal?: DestinoPostal
  /** Para envío a sucursal. */
  sucursal?: Pick<Sucursal, 'id' | 'nomenclatura' | 'descripcion'>
  productoAEntregar?: string
  /**
   * Notas que dejó el cliente en el checkout (timbre, referencias, horarios).
   * Se imprimen en el campo "Observaciones" de la etiqueta, que es lo que lee
   * quien hace la entrega.
   */
  notas?: string
}

export interface AndreaniOrdenResult {
  numeroDeEnvio: string | null
  estado?: string
  raw: unknown
}

const ORIGEN = {
  codigoPostal: process.env.ANDREANI_CP_ORIGEN || '1896',
  calle: process.env.ANDREANI_CALLE_ORIGEN || 'Calle 21A',
  numero: process.env.ANDREANI_NUMERO_ORIGEN || '1460',
  localidad: process.env.ANDREANI_LOCALIDAD_ORIGEN || 'City Bell',
  provincia: process.env.ANDREANI_PROVINCIA_ORIGEN || 'Buenos Aires',
  pais: 'Argentina',
}

const REMITENTE = {
  nombreCompleto: process.env.ANDREANI_REMITENTE_NOMBRE || 'Skilglass',
  email: process.env.ANDREANI_REMITENTE_EMAIL || 'hola@skilglass.com.ar',
  documentoTipo: process.env.ANDREANI_REMITENTE_DOC_TIPO || 'CUIT',
  documentoNumero: process.env.ANDREANI_REMITENTE_DOC_NUMERO || '',
  telefono: process.env.ANDREANI_REMITENTE_TELEFONO || '',
}

/**
 * Crea la orden de envío en Andreani.
 *
 * El schema sigue la especificación oficial de POST /v2/ordenes-de-envio:
 * `destinatario` es un ARRAY, `remitente` es obligatorio, los bultos usan `kilos`
 * y el origen va como objeto `origen.postal` (no existe el campo `sucursalDeEnvio`).
 */
export async function crearOrdenEnvio(input: CrearOrdenInput): Promise<AndreaniOrdenResult> {
  const contrato = contratoPara(input.tipoEnvio)
  if (!contrato) {
    throw new Error(`No hay contrato configurado para envío a ${input.tipoEnvio}`)
  }

  const destino =
    input.tipoEnvio === 'sucursal' && input.sucursal
      ? {
          // TODO: verificar en QA si Andreani espera `id` o `nomenclatura` para
          // identificar la sucursal de destino. Mandamos ambos.
          sucursal: {
            id: String(input.sucursal.id),
            nomenclatura: input.sucursal.nomenclatura || '',
            descripcion: input.sucursal.descripcion,
          },
        }
      : {
          postal: {
            codigoPostal: input.destinoPostal!.codigoPostal,
            calle: input.destinoPostal!.calle,
            numero: input.destinoPostal!.numero,
            piso: input.destinoPostal!.piso || '',
            departamento: input.destinoPostal!.departamento || '',
            localidad: input.destinoPostal!.localidad,
            region: input.destinoPostal!.provincia,
            pais: 'Argentina',
          },
        }

  // La etiqueta tiene poco espacio y es una linea sola: se recorta y se
  // aplanan los saltos de linea.
  const notasLimpias = (input.notas || '').replace(/\s+/g, ' ').trim().slice(0, 120)

  const payload = {
    contrato,
    idPedido: input.idPedido,
    origen: {
      postal: {
        codigoPostal: ORIGEN.codigoPostal,
        calle: ORIGEN.calle,
        numero: ORIGEN.numero,
        localidad: ORIGEN.localidad,
        region: ORIGEN.provincia,
        pais: ORIGEN.pais,
      },
    },
    destino,
    remitente: {
      nombreCompleto: REMITENTE.nombreCompleto,
      email: REMITENTE.email,
      documentoTipo: REMITENTE.documentoTipo,
      documentoNumero: REMITENTE.documentoNumero,
      telefonos: REMITENTE.telefono ? [{ tipo: 1, numero: REMITENTE.telefono }] : [],
    },
    destinatario: [
      {
        nombreCompleto: input.destinatario.nombreCompleto,
        email: input.destinatario.email,
        documentoTipo: input.destinatario.documentoTipo || 'DNI',
        documentoNumero: input.destinatario.documentoNumero,
        telefonos: [{ tipo: 1, numero: input.destinatario.telefono }],
      },
    ],
    productoAEntregar: input.productoAEntregar || 'Joyería en vidrio',
    bultos: [
      {
        kilos: input.bulto.kilos,
        volumenCm: input.bulto.volumenCm,
        valorDeclaradoSinImpuestos: input.bulto.valorDeclarado,
        valorDeclaradoConImpuestos: input.bulto.valorDeclarado,
        descripcion: input.productoAEntregar || 'Joyería en vidrio',
        // `referencias` con meta "observaciones" es lo que Andreani imprime en
        // el campo Observaciones de la etiqueta. Verificado contra QA.
        ...(notasLimpias ? { referencias: [{ meta: 'observaciones', contenido: notasLimpias }] } : {}),
      },
    ],
  }

  const response = await fetchConToken(`${ORDENES_BASE_URL}/v2/ordenes-de-envio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Error al crear orden en Andreani (${response.status}): ${await response.text()}`)
  }

  const data = await response.json()

  // El número de seguimiento vive dentro de bultos[], NO en la raíz de la respuesta.
  const numeroDeEnvio =
    data?.bultos?.[0]?.numeroDeEnvio ||
    data?.bultos?.[0]?.numeroDeBulto ||
    data?.numeroDeEnvio ||
    null

  return { numeroDeEnvio, estado: data?.estado, raw: data }
}

/**
 * Descarga el PDF de la etiqueta. Devuelve null si todavía no está disponible.
 *
 * La respuesta de Andreani llega como PDF binario; algunas cuentas devuelven
 * un JSON con la URL, que en ese caso se sigue.
 */
export async function obtenerEtiquetaPdf(numeroEnvio: string): Promise<ArrayBuffer | null> {
  const response = await fetchConToken(
    `${ORDENES_BASE_URL}/v2/ordenes-de-envio/${numeroEnvio}/etiquetas`
  )
  if (!response.ok) return null

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const data = await response.json()
    const url: string | undefined = data?.url || data?.etiquetaPdf
    if (!url) return null

    const pdf = await fetchConToken(url)
    return pdf.ok ? await pdf.arrayBuffer() : null
  }

  return await response.arrayBuffer()
}

/**
 * URL interna para ver la etiqueta desde el panel de pedidos.
 *
 * No se guarda la URL de Andreani porque exige el token de la cuenta: abrirla
 * desde Sanity devuelve 401. Esta apunta a nuestra ruta proxy, que valida el
 * token y adjunta el de Andreani del lado del servidor.
 */
export function urlEtiquetaInterna(numeroEnvio: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || ''
  const token = process.env.ETIQUETAS_ACCESS_TOKEN
  if (!baseUrl || !token) return ''
  return `${baseUrl}/api/andreani/etiqueta/${numeroEnvio}?token=${encodeURIComponent(token)}`
}

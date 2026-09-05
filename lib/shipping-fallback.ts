/**
 * Tabla estática de costos de envío por zona de código postal.
 *
 * Es una RED DE SEGURIDAD: sólo se usa si la API de tarifas de Andreani no responde.
 * Los valores salen de cotizaciones reales (contrato 400043021 domicilio /
 * 400043023 sucursal, pieza de 300g, valor declarado $50.000) redondeadas hacia
 * arriba: ante la duda conviene cobrar de más y no comerse la diferencia.
 *
 * Referencias medidas: CABA $16.002 · Mar del Plata $11.363 · Córdoba $11.363
 * Rosario $11.363 · Salta $16.002 · Bariloche $17.649 · Ushuaia $24.878.
 *
 * La tarifa de Andreani no es estrictamente por distancia (Salta cuesta lo mismo
 * que CABA), así que estos rangos son una aproximación gruesa a propósito.
 */

export interface ShippingZone {
  zona: string
  costoADomicilio: number
  costoSucursal: number
  diasEstimados: string
}

export function getCostoEnvioPorCP(cp: string): ShippingZone {
  const cpNum = parseInt(cp.replace(/\D/g, ''), 10)

  if (!Number.isFinite(cpNum)) {
    return { zona: 'Desconocida', costoADomicilio: 25000, costoSucursal: 15000, diasEstimados: '5-8' }
  }

  // CABA y Gran Buenos Aires
  if (cpNum >= 1000 && cpNum <= 1999) {
    return { zona: 'CABA y GBA', costoADomicilio: 16500, costoSucursal: 12500, diasEstimados: '2-4' }
  }

  // Litoral: Santa Fe, Entre Ríos, Corrientes, Misiones
  if (cpNum >= 2000 && cpNum <= 3999) {
    return { zona: 'Litoral', costoADomicilio: 12500, costoSucursal: 10000, diasEstimados: '3-5' }
  }

  // NOA: Salta, Jujuy, Tucumán, Santiago del Estero, Catamarca
  if (cpNum >= 4000 && cpNum <= 4999) {
    return { zona: 'NOA', costoADomicilio: 16500, costoSucursal: 12500, diasEstimados: '4-6' }
  }

  // Córdoba y Cuyo
  if (cpNum >= 5000 && cpNum <= 5999) {
    return { zona: 'Córdoba y Cuyo', costoADomicilio: 12500, costoSucursal: 10000, diasEstimados: '3-5' }
  }

  // Interior de Buenos Aires y La Pampa
  if (cpNum >= 6000 && cpNum <= 7999) {
    return { zona: 'Bs.As. Interior', costoADomicilio: 12500, costoSucursal: 10000, diasEstimados: '3-5' }
  }

  // Patagonia norte: Neuquén, Río Negro, sur de Buenos Aires
  if (cpNum >= 8000 && cpNum <= 8999) {
    return { zona: 'Patagonia Norte', costoADomicilio: 18000, costoSucursal: 14500, diasEstimados: '5-7' }
  }

  // Patagonia sur: Chubut, Santa Cruz, Tierra del Fuego
  return { zona: 'Patagonia Sur', costoADomicilio: 25000, costoSucursal: 15000, diasEstimados: '5-8' }
}

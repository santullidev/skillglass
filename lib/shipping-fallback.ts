/**
 * Tabla estática de costos de envío por zona de código postal.
 * Se usa como fallback cuando la API de Andreani no está disponible.
 * Zonas basadas en rangos de CP de Argentina.
 */

export interface ShippingZone {
  zona: string
  costoADomicilio: number
  costoSucursal: number
  diasEstimados: string
}

export function getCostoEnvioPorCP(cp: string): ShippingZone {
  const cpNum = parseInt(cp, 10)

  // CABA: 1000-1499
  if (cpNum >= 1000 && cpNum <= 1499) {
    return { zona: 'CABA', costoADomicilio: 2500, costoSucursal: 1800, diasEstimados: '1-2' }
  }

  // GBA Zona 1 (partidos cercanos): 1600-1999
  if (cpNum >= 1600 && cpNum <= 1999) {
    return { zona: 'GBA Zona 1', costoADomicilio: 3200, costoSucursal: 2200, diasEstimados: '2-3' }
  }

  // GBA Zona 2 (partidos lejanos): 1500-1599 y 2000-2999  
  if ((cpNum >= 1500 && cpNum <= 1599) || (cpNum >= 2000 && cpNum <= 2999)) {
    return { zona: 'GBA Zona 2', costoADomicilio: 3800, costoSucursal: 2600, diasEstimados: '2-4' }
  }

  // Provincia de Buenos Aires interior: 6000-8999
  if (cpNum >= 6000 && cpNum <= 8999) {
    return { zona: 'Bs.As. Interior', costoADomicilio: 5500, costoSucursal: 3800, diasEstimados: '3-5' }
  }

  // Córdoba, Santa Fe, Entre Ríos: 3000-5999
  if (cpNum >= 3000 && cpNum <= 5999) {
    return { zona: 'Centro', costoADomicilio: 5500, costoSucursal: 3800, diasEstimados: '3-5' }
  }

  // Rosario: 2000-2100
  if (cpNum >= 2000 && cpNum <= 2100) {
    return { zona: 'Rosario', costoADomicilio: 5000, costoSucursal: 3500, diasEstimados: '3-4' }
  }

  // Patagonia y norte: resto del país
  return { zona: 'Interior del País', costoADomicilio: 7500, costoSucursal: 5500, diasEstimados: '5-8' }
}

/**
 * lib/cart-validation.ts
 *
 * Validación del carrito que llega del cliente.
 *
 * Regla de oro: del navegador sólo se acepta QUÉ se compra (el id) y CUÁNTAS
 * unidades. Todo lo demás —precio, peso, disponibilidad— se resuelve en el
 * servidor contra Sanity. Sin esto, un carrito manipulado puede alterar el
 * total a pagar y el costo del envío.
 */

/** Líneas distintas admitidas en un pedido. */
export const MAX_LINEAS = 20
/** Unidades por línea. Son piezas de autor: nadie compra 50 del mismo anillo. */
export const MAX_UNIDADES_POR_LINEA = 10

export interface LineaValidada {
  id: string
  cantidad: number
  /** Campos cosméticos que sólo se usan para armar la preferencia de MP. */
  imagenUrl?: string
  numeroCertificado?: string
}

export type ResultadoValidacion =
  | { ok: true; lineas: LineaValidada[] }
  | { ok: false; error: string }

/**
 * Valida y normaliza los items del carrito.
 *
 * Rechaza cantidades negativas, cero, decimales, NaN y desmesuradas, además de
 * ids repetidos (que permitirían comprar dos veces la misma pieza única).
 */
export function validarCarrito(items: unknown): ResultadoValidacion {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'El carrito está vacío' }
  }

  if (items.length > MAX_LINEAS) {
    return { ok: false, error: `No se pueden comprar más de ${MAX_LINEAS} piezas distintas por pedido` }
  }

  const lineas: LineaValidada[] = []
  const idsVistos = new Set<string>()

  for (const item of items) {
    if (typeof item !== 'object' || item === null) {
      return { ok: false, error: 'Carrito inválido' }
    }

    const raw = item as Record<string, unknown>
    const id = typeof raw.id === 'string' ? raw.id.trim() : ''

    if (!id) {
      return { ok: false, error: 'Hay una pieza sin identificar en el carrito' }
    }
    if (idsVistos.has(id)) {
      return { ok: false, error: 'El carrito tiene la misma pieza repetida' }
    }
    idsVistos.add(id)

    // Number(null) es 0 y Number([]) es 0, así que se exige number o string.
    const tipoCantidad = typeof raw.cantidad
    if (raw.cantidad !== undefined && tipoCantidad !== 'number' && tipoCantidad !== 'string') {
      return { ok: false, error: 'Cantidad inválida' }
    }

    const cantidad = raw.cantidad === undefined ? 1 : Number(raw.cantidad)

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES_POR_LINEA) {
      return {
        ok: false,
        error: `La cantidad debe ser un número entero entre 1 y ${MAX_UNIDADES_POR_LINEA}`,
      }
    }

    lineas.push({
      id,
      cantidad,
      imagenUrl: typeof raw.imagenUrl === 'string' ? raw.imagenUrl : undefined,
      numeroCertificado: typeof raw.numeroCertificado === 'string' ? raw.numeroCertificado : undefined,
    })
  }

  return { ok: true, lineas }
}

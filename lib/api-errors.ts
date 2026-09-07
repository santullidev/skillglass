/**
 * lib/api-errors.ts
 *
 * Respuestas de error uniformes para las rutas de API.
 *
 * El detalle del error nunca viaja al cliente: los mensajes internos revelan
 * qué servicios se usan, qué variables de entorno faltan y qué responde cada
 * proveedor, que es material de reconocimiento para un atacante. Al cliente le
 * damos un mensaje genérico y un id de correlación; el detalle queda en los
 * logs del servidor, donde se lo busca por ese id.
 */

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * Loguea el error completo del lado del servidor y devuelve una respuesta
 * genérica con un id para poder rastrearlo.
 */
export function errorInterno(
  contexto: string,
  error: unknown,
  mensajePublico = 'Ocurrió un error procesando tu pedido. Intentá de nuevo en unos minutos.',
  status = 500
) {
  const errorId = randomUUID().slice(0, 8)
  console.error(`[${errorId}] ${contexto}:`, error)

  return NextResponse.json({ error: mensajePublico, errorId }, { status })
}

/** Error de validación: el mensaje sí se muestra, porque describe el input del usuario. */
export function errorDeValidacion(mensaje: string, status = 400) {
  return NextResponse.json({ error: mensaje }, { status })
}

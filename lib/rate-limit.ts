/**
 * lib/rate-limit.ts
 *
 * Limitador de tasa por ventana fija, en memoria del proceso.
 *
 * ⚠️ Alcance: el contador vive en la instancia. En un despliegue con varias
 * instancias (o funciones serverless que escalan) cada una lleva su propia
 * cuenta, así que el límite efectivo se multiplica por la cantidad de
 * instancias. Alcanza para frenar abuso automatizado y scripts sueltos, que es
 * el riesgo real de este sitio; si en algún momento hace falta un límite
 * estricto y global, hay que moverlo a un store compartido (Redis/Upstash)
 * respetando esta misma interfaz.
 */

import type { NextRequest } from 'next/server'

interface Contador {
  hits: number
  expiraEn: number
}

const contadores = new Map<string, Contador>()

/** Techo de claves en memoria, para que un atacante no infle el Map sin control. */
const MAX_CLAVES = 10_000

function limpiarVencidos(ahora: number) {
  for (const [clave, contador] of contadores) {
    if (contador.expiraEn <= ahora) contadores.delete(clave)
  }
}

export interface ResultadoLimite {
  permitido: boolean
  restantes: number
  /** Segundos hasta que se libere el cupo. Sirve para la cabecera Retry-After. */
  reintentarEn: number
}

export function rateLimit(clave: string, limite: number, ventanaMs: number): ResultadoLimite {
  const ahora = Date.now()

  if (contadores.size > MAX_CLAVES) limpiarVencidos(ahora)

  const actual = contadores.get(clave)

  if (!actual || actual.expiraEn <= ahora) {
    contadores.set(clave, { hits: 1, expiraEn: ahora + ventanaMs })
    return { permitido: true, restantes: limite - 1, reintentarEn: Math.ceil(ventanaMs / 1000) }
  }

  actual.hits += 1
  const reintentarEn = Math.max(1, Math.ceil((actual.expiraEn - ahora) / 1000))

  return {
    permitido: actual.hits <= limite,
    restantes: Math.max(0, limite - actual.hits),
    reintentarEn,
  }
}

/**
 * IP del cliente. Detrás de Vercel llega en x-forwarded-for; se toma el primer
 * valor, que es el del cliente original.
 *
 * ⚠️ Estas cabeceras son falsificables si la app queda expuesta sin un proxy
 * que las reescriba. Es aceptable para limitar abuso (no es un control de
 * acceso), pero nunca debe usarse para autenticar ni autorizar.
 */
export function obtenerIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return req.headers.get('x-real-ip')?.trim() || 'desconocida'
}

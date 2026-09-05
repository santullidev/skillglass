import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { obtenerEtiquetaPdf } from '@/lib/andreani'
import { errorInterno } from '@/lib/api-errors'
import { rateLimit, obtenerIp } from '@/lib/rate-limit'

/**
 * Sirve el PDF de la etiqueta de Andreani.
 *
 * La URL de Andreani necesita el token de la cuenta, así que un link directo
 * guardado en Sanity devuelve 401 al abrirlo. Esta ruta hace de proxy y
 * adjunta el token del lado del servidor.
 *
 * ⚠️ La etiqueta contiene el nombre, el teléfono y el domicilio del cliente.
 * Por eso NO es pública: hace falta ETIQUETAS_ACCESS_TOKEN, que es el mismo
 * secreto que se anexa al link guardado en el panel de pedidos.
 */

const accessToken = process.env.ETIQUETAS_ACCESS_TOKEN

/** Number de envío de Andreani: sólo dígitos. */
const NUMERO_VALIDO = /^\d{6,30}$/

function tokensIguales(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ numero: string }> }) {
  const limite = rateLimit(`etiqueta:${obtenerIp(req)}`, 30, 60 * 1000)
  if (!limite.permitido) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  if (!accessToken) {
    console.error('ETIQUETAS_ACCESS_TOKEN no configurado: la ruta de etiquetas queda deshabilitada')
    return NextResponse.json({ error: 'No disponible' }, { status: 503 })
  }

  const tokenRecibido = req.nextUrl.searchParams.get('token')
  if (!tokenRecibido || !tokensIguales(tokenRecibido, accessToken)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { numero } = await params
  if (!NUMERO_VALIDO.test(numero)) {
    return NextResponse.json({ error: 'Número de envío inválido' }, { status: 400 })
  }

  try {
    const pdf = await obtenerEtiquetaPdf(numero)
    if (!pdf) {
      return NextResponse.json({ error: 'Etiqueta no disponible todavía' }, { status: 404 })
    }

    return new NextResponse(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="etiqueta-${numero}.pdf"`,
        // Contiene datos personales: que no quede en caches intermedias.
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (error) {
    return errorInterno('etiqueta', error, 'No pudimos obtener la etiqueta')
  }
}

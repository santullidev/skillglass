import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'crypto'

/** Comparación en tiempo constante, para no filtrar el secreto por timing. */
function secretosIguales(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

// Endpoint interno para invalidar el cache de una página de producto.
// El webhook de MercadoPago ya no lo usa (llama a revalidatePath en proceso);
// queda disponible para invalidaciones manuales o desde Sanity.
export async function POST(req: NextRequest) {
  try {
    const { slug, token } = await req.json()

    // Validar token interno para evitar uso no autorizado
    const expected = process.env.REVALIDATE_SECRET
    if (!expected) {
      console.error('REVALIDATE_SECRET no configurado: la ruta queda deshabilitada')
      return NextResponse.json({ error: 'No disponible' }, { status: 503 })
    }
    if (typeof token !== 'string' || !secretosIguales(token, expected)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Falta el slug del producto' }, { status: 400 })
    }

    // Invalida el cache de Next.js para esta página de producto
    revalidatePath(`/productos/${slug}`)
    // También invalida el listado general
    revalidatePath('/productos')

    console.log(`🔄 Cache invalidado para /productos/${slug}`)
    return NextResponse.json({ revalidated: true, slug })

  } catch (error) {
    console.error('Error al revalidar producto:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

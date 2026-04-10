import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Endpoint interno para invalidar el cache de una página de producto
// Solo acepta llamadas con el token correcto (llamado desde el webhook de MP)
export async function POST(req: NextRequest) {
  try {
    const { slug, token } = await req.json()

    // Validar token interno para evitar uso no autorizado
    const expected = process.env.REVALIDATE_SECRET || process.env.MP_ACCESS_TOKEN?.slice(-12)
    if (token !== expected) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!slug) {
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

import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Invalida todas las páginas que consumen contenido de Sanity
  revalidatePath('/')
  revalidatePath('/productos')
  revalidatePath('/colecciones')
  revalidatePath('/estudio')

  console.log('🔄 Cache invalidado por webhook de Sanity')
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
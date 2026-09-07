import { NextRequest, NextResponse } from 'next/server'
import { buscarSucursalesPorCP } from '@/lib/andreani'

/**
 * Sucursales de Andreani que atienden un código postal.
 * El endpoint de Andreani es público, así que esto funciona sin credenciales.
 */
export async function GET(req: NextRequest) {
  const cp = req.nextUrl.searchParams.get('cp')?.trim() || ''

  if (!/^\d{4}([A-Za-z]{3})?$/.test(cp)) {
    return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
  }

  try {
    const sucursales = await buscarSucursalesPorCP(cp.replace(/\D/g, ''))
    return NextResponse.json({ success: true, sucursales })
  } catch (error) {
    console.error('Error al buscar sucursales de Andreani:', error)
    return NextResponse.json({ error: 'No se pudieron obtener las sucursales' }, { status: 502 })
  }
}

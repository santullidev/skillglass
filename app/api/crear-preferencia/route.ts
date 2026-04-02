import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Acepta { items: [...] } del carrito o los datos de 1 producto del botón viejo
    const requestItems = body.items || [
      {
        nombre: body.nombre,
        precio: body.precio,
        slug: body.slug,
        cantidad: 1
      }
    ]

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const mpItems = requestItems.map((item: any) => ({
      id: item.id || item.slug || 'N/A',
      title: item.nombre || item.title || 'Producto SKILGLASS',
      quantity: Number(item.cantidad || 1),
      unit_price: Number(item.precio || item.unit_price || 0),
      currency_id: 'ARS',
      picture_url: item.imagenUrl || item.picture_url,
    }))

    const preference = new Preference(client)

    const response = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${baseUrl}/pago/exitoso`,
          failure: `${baseUrl}/pago/error`,
          pending: `${baseUrl}/pago/pendiente`,
        },
      },
    })

    // Return init_point for redirect, and ID (needed by cart flow)
    return NextResponse.json({ url: response.init_point, id: response.id })
  } catch (error) {
    console.error('MP Error:', error)
    return NextResponse.json(
      { error: 'Error al crear la preferencia' },
      { status: 500 }
    )
  }
}
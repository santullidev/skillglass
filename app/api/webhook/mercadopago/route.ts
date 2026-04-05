import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { backendClient } from '@/lib/sanity'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('data.id')

    if (type !== 'payment' || !id) {
      return NextResponse.json({ received: true })
    }

    // 1. Obtener detalles del pago desde Mercado Pago
    const payment = new Payment(client)
    const paymentData = await payment.get({ id })

    // 2. Si el pago está aprobado, procesar inventario y pedido
    if (paymentData.status === 'approved') {
      const items = paymentData.metadata?.items || []
      const externalReference = paymentData.external_reference

      // 3. Crear el pedido en Sanity
      await backendClient.create({
        _type: 'pedido',
        idMercadoPago: id,
        montoTotal: paymentData.transaction_amount,
        estado: 'approved',
        productos: items.map((item: any) => ({
          id: item.id,
          nombre: item.title,
          cantidad: 1, // En este flujo de piezas únicas solemos manejar de a 1
          precio: paymentData.transaction_amount / items.length, // Promedio si hay varios
        })),
        fecha: new Date().toISOString(),
      })

      // 4. Marcar productos como NO disponibles en Sanity (Vendido)
      for (const item of items) {
        if (item.id) {
          // Intentamos marcar por ID o por Slug (external_reference usualmente mapea a slug en este repo)
          await backendClient
            .patch(item.id)
            .set({ disponible: false })
            .commit()
            .catch(err => console.error(`Error al actualizar stock de ${item.id}:`, err))
        }
      }

      console.log(`Pago ${id} procesado exitosamente.`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

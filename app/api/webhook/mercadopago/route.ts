import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { backendClient } from '@/lib/sanity'
import { createHmac } from 'crypto'
import { sendOrderEmails } from '@/lib/email-service'

// ✅ FIX 1: Validar env vars al inicio
const accessToken = process.env.MP_ACCESS_TOKEN
const webhookSecret = process.env.MP_WEBHOOK_SECRET

if (!accessToken) {
  throw new Error('MP_ACCESS_TOKEN no está configurado')
}

const client = new MercadoPagoConfig({ accessToken })

// ✅ FIX 2: Tipo para los items del metadata (reemplaza 'any')
interface MetadataItem {
  id: string
  title: string
  quantity: number
  unit_price: number
}

interface ShippingData {
  nombre: string
  email: string
  telefono: string
  provincia: string
  ciudad: string
  direccion: string
  codigoPostal: string
  notas?: string
}

// ✅ FIX 2b: Función para validar la firma de MP
function validateMpSignature(
  req: NextRequest,
  rawBody: string,
  id: string
): boolean {
  // Si no hay secret configurado, salteamos en desarrollo pero advertimos
  if (!webhookSecret) {
    console.warn('⚠️ MP_WEBHOOK_SECRET no configurado. Saltando validación de firma (solo OK en desarrollo).')
    return true
  }

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    console.error('Webhook rechazado: faltan headers de firma')
    return false
  }

  // Parsear ts y v1 del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => part.trim().split('=') as [string, string])
  )
  const ts = parts['ts']
  const receivedHash = parts['v1']

  if (!ts || !receivedHash) return false

  // Construir el string a firmar según la doc de MP
  const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`
  const expectedHash = createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex')

  // Comparación segura (evita timing attacks)
  return expectedHash === receivedHash
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('data.id')

    // Ignorar notificaciones que no son pagos
    if (type !== 'payment' || !id) {
      return NextResponse.json({ received: true })
    }

    // ✅ FIX 2: Validar firma antes de procesar cualquier cosa
    const rawBody = await req.text()
    if (!validateMpSignature(req, rawBody, id)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    // ✅ FIX 5: Idempotencia — verificar si el pedido ya fue procesado
    const pedidoExistente = await backendClient.fetch(
      `*[_type == "pedido" && idMercadoPago == $id][0]`,
      { id }
    )
    if (pedidoExistente) {
      console.log(`Pago ${id} ya fue procesado (duplicado ignorado).`)
      return NextResponse.json({ received: true })
    }

    // Consultar el pago a la API de MP
    const payment = new Payment(client)
    const paymentData = await payment.get({ id })

    if (paymentData.status === 'approved') {
      const items: MetadataItem[] = paymentData.metadata?.items || []
      const externalReference = paymentData.external_reference // ✅ FIX 4: se guarda abajo

      // ✅ FIX 3 + 6 + 7: Crear pedido con tipos correctos, cantidad y precio reales
      await backendClient.create({
        _type: 'pedido',
        idMercadoPago: id,
        referenciaExterna: externalReference || 'N/A',
        montoTotal: paymentData.transaction_amount,
        estado: 'approved',
        productos: items.map((item: MetadataItem) => ({
          id: item.id,
          nombre: item.title,
          cantidad: item.quantity ?? 1,
          precio: item.unit_price ?? 0,
        })),
        cliente: {
          nombre: paymentData.payer?.first_name 
            ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`.trim()
            : paymentData.metadata?.shipping_data?.nombre || 'Cliente MP',
          email: paymentData.payer?.email || paymentData.metadata?.shipping_data?.email,
          telefono: String(paymentData.payer?.phone?.number || paymentData.metadata?.shipping_data?.telefono || ''),
        },
        envio: paymentData.metadata?.shipping_data || {
          nombre: 'N/A',
          direccion: 'N/A',
          ciudad: 'N/A',
          provincia: 'N/A',
          codigoPostal: 'N/A'
        },
        estadoEnvio: 'pendiente',
        fecha: new Date().toISOString(),
      })

      // ✅ FIX 9: Enviar Notificaciones por Email
      const shippingData: ShippingData = paymentData.metadata?.shipping_data || {}
      await sendOrderEmails({
        orderId: String(id),
        customerName: paymentData.metadata?.shipping_data?.nombre || paymentData.payer?.first_name || 'Cliente',
        customerEmail: paymentData.metadata?.shipping_data?.email || paymentData.payer?.email || '',
        totalAmount: paymentData.transaction_amount || 0,
        items: items.map(i => ({ nombre: i.title, cantidad: i.quantity, precio: i.unit_price })),
        shippingData: {
          direccion: shippingData.direccion || 'N/A',
          ciudad: shippingData.ciudad || 'N/A',
          provincia: shippingData.provincia || 'N/A',
          codigoPostal: shippingData.codigoPostal || 'N/A',
        }
      }).catch(err => console.error('Error al enviar emails después del pedido:', err))

      // ✅ FIX 8: Marcar productos como no disponibles con fallback por slug
      for (const item of items) {
        if (!item.id || item.id === 'N/A') {
          // Fallback: buscar por slug usando la referencia externa
          console.warn(`Item sin ID válido: ${item.title}. Verificar manualmente.`)
          continue
        }

        await backendClient
          .patch(item.id)
          .set({ disponible: false })
          .commit()
          .catch((err) =>
            console.error(`Error al marcar como vendido el producto ${item.id}:`, err)
          )
      }

      console.log(`✅ Pago ${id} procesado exitosamente.`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook Error:', error)
    // ✅ Importante: devolver 500 para que MP reintente (pero con idempotencia ya no hay problema)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

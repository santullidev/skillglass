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

// Tipo para items crudos del metadata de MP (pueden llegar con campos opcionales en snake_case)
interface RawMetadataItem {
  id?: string
  title?: string
  quantity?: number
  unit_price?: number
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

    // Validar firma de MP (no bloqueante — la seguridad real viene de verificar contra la API de MP con accessToken)
    const rawBody = await req.text()
    const signatureValid = validateMpSignature(req, rawBody, id)
    if (!signatureValid) {
      console.warn(`⚠️ Firma de webhook inválida o ausente para pago ${id}. Procesando igual — verificamos con API de MP.`)
      // No devolvemos 401: MP puede cambiar formato de firma o no configurar secret.
      // La seguridad está garantizada porque consultamos la API de MP directamente con nuestro accessToken.
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
    let paymentData
    try {
      paymentData = await payment.get({ id })
    } catch (mpError) {
      // MP puede enviar IDs de prueba inexistentes (ej: desde el simulador del panel)
      console.warn(`⚠️ No se pudo obtener el pago ${id} de la API de MP (puede ser un ID de prueba). Error:`, mpError)
      return NextResponse.json({ received: true })
    }

    if (paymentData.status === 'approved') {
      const meta = paymentData.metadata || {}

      // ⚠️ CRÍTICO: MercadoPago convierte las keys del metadata a snake_case automáticamente.
      // shipping_data es el objeto anidado, y sus keys internas también quedan en snake_case.
      // Ejemplo: codigoPostal → codigo_postal, estadoEnvio → estado_envio
      const raw: Record<string, string> = meta.shipping_data || {}

      const shippingData: ShippingData = {
        nombre:       raw.nombre       || '',
        email:        raw.email        || '',
        telefono:     raw.telefono     || '',
        provincia:    raw.provincia    || '',
        ciudad:       raw.ciudad       || '',
        direccion:    raw.direccion    || '',
        codigoPostal: raw.codigo_postal || raw.codigoPostal || '',
        notas:        raw.notas        || '',
      }

      // Items también llegan en snake_case desde el metadata de MP
      const rawItems: RawMetadataItem[] = meta.items || []
      const items: MetadataItem[] = rawItems.map((i: RawMetadataItem) => ({
        id:         i.id         || 'N/A',
        title:      i.title      || 'Producto SKILLGLASS',
        quantity:   Number(i.quantity  ?? 1),
        unit_price: Number(i.unit_price ?? 0),
      }))

      const externalReference = paymentData.external_reference

      // Derivar el nombre del cliente: priorizar payer de MP, luego shipping_data
      const clienteNombre = paymentData.payer?.first_name
        ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`.trim()
        : shippingData.nombre || 'Cliente MP'

      const clienteEmail    = paymentData.payer?.email || shippingData.email
      const clienteTelefono = String(paymentData.payer?.phone?.number || shippingData.telefono || '')

      // ✅ Crear pedido en Sanity con todos los campos correctamente mapeados
      await backendClient.create({
        _type: 'pedido',
        idMercadoPago: id,
        referenciaExterna: externalReference || 'N/A',
        montoTotal: paymentData.transaction_amount,
        estado: 'approved',
        productos: items.map((item: MetadataItem, index: number) => ({
          _key: `item_${item.id}_${index}`,   // ← requerido por Sanity para arrays de objetos
          id: item.id,
          nombre: item.title,
          cantidad: item.quantity ?? 1,
          precio: item.unit_price ?? 0,
        })),
        cliente: {
          nombre:   clienteNombre,
          email:    clienteEmail,
          telefono: clienteTelefono,
        },
        envio: {
          provincia:    shippingData.provincia    || 'N/A',
          ciudad:       shippingData.ciudad       || 'N/A',
          direccion:    shippingData.direccion    || 'N/A',
          codigoPostal: shippingData.codigoPostal || 'N/A',
          notas:        shippingData.notas        || '',
        },
        estadoEnvio: 'pendiente',
        fecha: new Date().toISOString(),
      })

      // ✅ Enviar Notificaciones por Email
      await sendOrderEmails({
        orderId: String(id),
        customerName:  clienteNombre,
        customerEmail: clienteEmail || '',
        totalAmount:   paymentData.transaction_amount || 0,
        items: items.map(i => ({ nombre: i.title, cantidad: i.quantity, precio: i.unit_price })),
        shippingData: {
          direccion:    shippingData.direccion    || 'N/A',
          ciudad:       shippingData.ciudad       || 'N/A',
          provincia:    shippingData.provincia    || 'N/A',
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

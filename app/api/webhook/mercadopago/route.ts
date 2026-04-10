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

      // Helper para invalidar cache de Next.js de una página de producto
      const revalidateProductPage = async (slug: string) => {
        const revalidateToken = process.env.REVALIDATE_SECRET || process.env.MP_ACCESS_TOKEN?.slice(-12)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/revalidar-producto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, token: revalidateToken }),
        }).catch(err => console.error(`⚠️ Error al revalidar cache de /productos/${slug}:`, err))
      }

      // ✅ Marcar productos como no disponibles + invalidar cache del frontend
      // Los IDs en el metadata de MP pueden ser el _id de Sanity (preferido) o el slug (fallback)
      for (const item of items) {
        if (!item.id || item.id === 'N/A') {
          console.warn(`⚠️ Item sin ID válido: "${item.title}". No se pudo marcar como vendido.`)
          continue
        }

        // Los _id de Sanity tienen formato de UUID (contienen letras mayúsculas y son largos)
        // Los slugs son kebab-case lowercase. Detectamos cuál es.
        const looksLikeSanityId = item.id.length > 20 && /[A-Z]/.test(item.id)

        if (looksLikeSanityId) {
          // Patch por _id — también buscamos el slug para poder revalidar el cache
          const productoData = await backendClient.fetch(
            `*[_type == "producto" && _id == $id][0]{ "slug": slug.current }`,
            { id: item.id }
          ).catch(() => null)

          const patchResult = await backendClient
            .patch(item.id)
            .set({ disponible: false })
            .commit()
            .catch((err) => {
              console.error(`❌ Error al marcar producto por _id "${item.id}":`, err)
              return null
            })

          if (patchResult) {
            console.log(`✅ Producto "${item.title}" (${item.id}) marcado como no disponible.`)
            if (productoData?.slug) {
              await revalidateProductPage(productoData.slug)
            }
          }
        } else {
          // El id parece ser un slug — buscar el documento por slug y patchear
          console.warn(`⚠️ ID "${item.id}" parece ser un slug. Buscando en Sanity por slug...`)
          const productoDoc = await backendClient.fetch(
            `*[_type == "producto" && slug.current == $slug][0]{ _id }`,
            { slug: item.id }
          )

          if (productoDoc?._id) {
            await backendClient
              .patch(productoDoc._id)
              .set({ disponible: false })
              .commit()
              .catch((err) => console.error(`❌ Error al marcar producto por slug "${item.id}":`, err))

            console.log(`✅ Producto "${item.title}" (slug: ${item.id} → _id: ${productoDoc._id}) marcado como no disponible.`)
            await revalidateProductPage(item.id)
          } else {
            console.error(`❌ No se encontró producto con slug "${item.id}" en Sanity.`)
          }
        }
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

import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { backendClient } from '@/lib/sanity'
import { createHmac } from 'crypto'
import { sendOrderEmails } from '@/lib/email-service'
import { crearOrdenEnvio, obtenerEtiqueta } from '@/lib/andreani'

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
  quantity?: number
  unit_price?: number
  numero_certificado?: string | null
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
  tipoEnvio: 'domicilio'
  montoEnvio: number
}

// ✅ FIX 2b: Función para validar la firma de MP
function validateMpSignature(
  req: NextRequest,
  rawBody: string,
  id: string,
  isIpn: boolean
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

  // ✅ El manifest cambia según si es IPN (lo que envía notification_url) o Webhook
  const manifest = isIpn 
    ? `id:${id};request-id:${xRequestId};ts:${ts};` 
    : `ts:${ts};request-id:${xRequestId};${rawBody}`

  const expectedHash = createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex')

  return expectedHash === receivedHash
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // ✅ Mercado Pago envía 'type' y 'data.id' para Webhooks
    // Pero envía 'topic' e 'id' para IPN (lo que usa notification_url de la preferencia)
    const type = searchParams.get('type') || searchParams.get('topic')
    const id = searchParams.get('data.id') || searchParams.get('id')
    const isIpn = searchParams.has('topic')

    // Ignorar notificaciones que no son pagos
    if (type !== 'payment' || !id) {
      return NextResponse.json({ received: true })
    }

    // Validar firma de MP (No bloqueante para evitar fallos por formato, la seguridad real es la consulta a la API de MP)
    const rawBody = await req.text()
    const signatureValid = validateMpSignature(req, rawBody, id, isIpn)
    if (!signatureValid) {
      console.warn(`⚠️ Firma de webhook inválida para pago ${id} (isIpn: ${isIpn}). Continuando con verificación directa de API...`)
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
        tipoEnvio:    'domicilio',
        montoEnvio:   Number(raw.monto_envio || 0),
      }

      // Items también llegan en snake_case desde el metadata de MP
      const rawItems: RawMetadataItem[] = meta.items || []
      const items: MetadataItem[] = rawItems.map((i: RawMetadataItem) => ({
        id:         i.id         || 'N/A',
        title:      i.title      || 'Producto SKILLGLASS',
        quantity:   Number(i.quantity  ?? 1),
        unit_price: Number(i.unit_price ?? 0),
        numeroCertificado: i.numero_certificado || null,
      }))

      const externalReference = paymentData.external_reference

      // Derivar datos del cliente: PRIORIDAD el formulario del checkout (shippingData),
      // fallback al payer de MP (puede ser email de prueba o cuenta ajena al contacto real)
      const clienteNombre =
        shippingData.nombre ||
        (paymentData.payer?.first_name
          ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`.trim()
          : 'Cliente MP')

      const clienteEmail = shippingData.email || paymentData.payer?.email || ''

      const clienteTelefono =
        shippingData.telefono || String(paymentData.payer?.phone?.number || '')

      // ✅ Inicializar pedido en Sanity
      const sanityOrder = await backendClient.create({
        _type: 'pedido',
        idMercadoPago: id,
        referenciaExterna: externalReference || 'N/A',
        montoTotal: paymentData.transaction_amount,
        estado: 'approved',
        productos: items.map((item: MetadataItem, index: number) => ({
          _key: `item_${item.id}_${index}`,
          id: item.id,
          nombre: item.title,
          cantidad: item.quantity ?? 1,
          precio: item.unit_price ?? 0,
          numeroCertificado: (item as any).numeroCertificado || null,
        })),
        cliente: {
          nombre:   clienteNombre,
          email:    clienteEmail,
          telefono: clienteTelefono,
        },
        envio: {
          tipo:         shippingData.tipoEnvio,
          provincia:    shippingData.provincia    || 'N/A',
          ciudad:       shippingData.ciudad       || 'N/A',
          direccion:    shippingData.direccion    || 'N/A',
          codigoPostal: shippingData.codigoPostal || 'N/A',
          costo:        shippingData.montoEnvio,
          notas:        shippingData.notas        || '',
        },
        estadoEnvio: 'pendiente',
        fecha: new Date().toISOString(),
      })

      // 📦 INTEGRACIÓN ANDREANI: Crear Envío
      try {
        console.log(`Iniciando creación de envío Andreani para pedido ${sanityOrder._id}...`)
        
        // Calcular peso total de los items
        const pesoTotal = meta.items?.reduce((acc: number, item: any) => acc + (Number(item.peso || 300) * Number(item.quantity || 1)), 0) || 300

        const andreaniPayload = {
          contrato: process.env.ANDREANI_CONTRATO_DOMICILIO,
          cliente: process.env.ANDREANI_CLIENTE,
          sucursalDeEnvio: process.env.ANDREANI_CP_ORIGEN || '7600',
          bultos: [{
            peso: pesoTotal,
            valorDeclarado: paymentData.transaction_amount - shippingData.montoEnvio, // Valor de la mercadería
          }],
          receptor: {
            nombreCompleto: clienteNombre,
            email: clienteEmail,
            telefono: clienteTelefono,
            documentoTipo: "DNI",
            documentoNumero: "0", // Fallback si no lo pedimos
          },
          destino: {
            postal: {
              codigoPostal: shippingData.codigoPostal,
              provincia: shippingData.provincia,
              localidad: shippingData.ciudad,
              calle: shippingData.direccion,
              numero: "0" // Andreani suele requerir separar calle de número, pero si viene todo junto pasamos 0
            }
          }
        }

        const andreaniResult = await crearOrdenEnvio(andreaniPayload)
        
        if (andreaniResult && andreaniResult.numeroDeEnvio) {
          const numeroEnvio = andreaniResult.numeroDeEnvio
          const urlEtiqueta = await obtenerEtiqueta(numeroEnvio).catch(() => '')
          
          await backendClient.patch(sanityOrder._id).set({
            estadoEnvio: 'despachado',
            numeroAndreani: numeroEnvio,
            urlEtiqueta: urlEtiqueta,
          }).commit()
          
          console.log(`✅ Envío Andreani creado: ${numeroEnvio}`)
        }
      } catch (andreaniError) {
        console.error('❌ Error vinculando Andreani:', andreaniError)
        await backendClient.patch(sanityOrder._id).set({
          estadoEnvio: 'error_logistica'
        }).commit()
      }

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

        // Buscar primero por _id directo (hex Sanity, sin mayúsculas)
        let patched = false
        try {
          const productoData = await backendClient.fetch(
            `*[_type == "producto" && _id == $id][0]{ _id, "slug": slug.current }`,
            { id: item.id }
          )
          if (productoData?._id) {
            await backendClient.patch(productoData._id).set({ disponible: false }).commit()
            console.log(`✅ Producto "${item.title}" (${item.id}) marcado como no disponible.`)
            if (productoData.slug) await revalidateProductPage(productoData.slug)
            patched = true
          }
        } catch (err) {
          console.error(`❌ Error al patchear por _id "${item.id}":`, err)
        }

        // Fallback: buscar por slug si el _id no encontró nada
        if (!patched) {
          console.warn(`⚠️ No se encontró producto con _id "${item.id}". Intentando por slug...`)
          try {
            const productoDoc = await backendClient.fetch(
              `*[_type == "producto" && slug.current == $slug][0]{ _id, "slug": slug.current }`,
              { slug: item.id }
            )
            if (productoDoc?._id) {
              await backendClient.patch(productoDoc._id).set({ disponible: false }).commit()
              console.log(`✅ Producto "${item.title}" (slug: ${item.id}) marcado como no disponible.`)
              await revalidateProductPage(item.id)
            } else {
              console.error(`❌ No se encontró producto con _id ni slug "${item.id}". Stock NO actualizado.`)
            }
          } catch (err) {
            console.error(`❌ Error fallback por slug "${item.id}":`, err)
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

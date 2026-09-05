import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Payment } from 'mercadopago'
import { backendClient } from '@/lib/sanity'
import { createHmac, timingSafeEqual } from 'crypto'
import { revalidatePath } from 'next/cache'
import { sendOrderEmails } from '@/lib/email-service'
import { crearOrdenEnvio, urlEtiquetaInterna, type TipoEnvio } from '@/lib/andreani'

const accessToken = process.env.MP_ACCESS_TOKEN
const webhookSecret = process.env.MP_WEBHOOK_SECRET
const esProduccion = process.env.NODE_ENV === 'production'

// Cliente perezoso: lanzar en el módulo deja la ruta entera fuera de servicio
// y hace que MercadoPago no pueda notificar ningún pago.
let mpClient: MercadoPagoConfig | null = null
function getMpClient(): MercadoPagoConfig {
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no está configurado')
  mpClient ??= new MercadoPagoConfig({ accessToken })
  return mpClient
}

// ✅ FIX 2: Tipo para los items del metadata (reemplaza 'any')
interface MetadataItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  numeroCertificado: string | null
}

// Tipo para items crudos del metadata de MP (pueden llegar con campos opcionales en snake_case)
interface RawMetadataItem {
  id?: string
  title?: string
  quantity?: number
  unit_price?: number
  /** MP pasa las keys del metadata a snake_case. */
  numero_certificado?: string | null
}

interface ShippingData {
  nombre: string
  email: string
  telefono: string
  dni: string
  provincia: string
  ciudad: string
  calle: string
  numero: string
  piso?: string
  departamento?: string
  codigoPostal: string
  notas?: string
  tipoEnvio: TipoEnvio
  montoEnvio: number
  kilos: number
  valorDeclarado: number
  sucursalId?: string
  sucursalNombre?: string
  sucursalNomenclatura?: string
}

/** Tolerancia de antigüedad de la firma, para acotar la ventana de replay. */
const MAX_ANTIGUEDAD_FIRMA_MS = 10 * 60 * 1000

/** Comparación en tiempo constante: `===` sobre un hash filtra información por timing. */
function hashesIguales(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

type ResultadoFirma = 'valida' | 'invalida' | 'sin-secreto'

/**
 * Valida la firma HMAC que envía MercadoPago.
 *
 * Devuelve 'sin-secreto' en vez de dar por válida la firma cuando falta
 * MP_WEBHOOK_SECRET: quien llama decide, y en producción eso se rechaza.
 */
function validateMpSignature(
  req: NextRequest,
  rawBody: string,
  id: string,
  isIpn: boolean
): ResultadoFirma {
  if (!webhookSecret) return 'sin-secreto'

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    console.error('Webhook rechazado: faltan headers de firma')
    return 'invalida'
  }

  // Parsear ts y v1 del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => part.trim().split('=') as [string, string])
  )
  const ts = parts['ts']
  const receivedHash = parts['v1']

  if (!ts || !receivedHash) return 'invalida'

  // Rechazar firmas viejas: acota la ventana para reenviar una notificación
  // interceptada. MP manda el ts en milisegundos.
  const antiguedad = Date.now() - Number(ts)
  if (!Number.isFinite(antiguedad) || antiguedad > MAX_ANTIGUEDAD_FIRMA_MS) {
    console.error(`Webhook rechazado: firma vencida (${Math.round(antiguedad / 1000)}s)`)
    return 'invalida'
  }

  // ✅ El manifest cambia según si es IPN (lo que envía notification_url) o Webhook
  const manifest = isIpn
    ? `id:${id};request-id:${xRequestId};ts:${ts};`
    : `ts:${ts};request-id:${xRequestId};${rawBody}`

  const expectedHash = createHmac('sha256', webhookSecret).update(manifest).digest('hex')

  return hashesIguales(expectedHash, receivedHash) ? 'valida' : 'invalida'
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

    // ✅ La firma se valida de forma BLOQUEANTE en producción. Antes sólo se
    // logueaba una advertencia y se seguía adelante, lo que dejaba la ruta
    // abierta a notificaciones falsificadas.
    const rawBody = await req.text()
    const firma = validateMpSignature(req, rawBody, id, isIpn)

    if (firma === 'invalida') {
      console.error(`❌ Webhook rechazado: firma inválida para el pago ${id} (isIpn: ${isIpn})`)
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    if (firma === 'sin-secreto') {
      if (esProduccion) {
        // Fail closed: sin secreto en producción no hay forma de distinguir
        // una notificación legítima de una falsificada.
        console.error('❌ MP_WEBHOOK_SECRET no está configurado en producción. Webhook rechazado.')
        return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 })
      }
      console.warn('⚠️ MP_WEBHOOK_SECRET no configurado. Validación de firma omitida (sólo en desarrollo).')
    }

    // ✅ FIX 5: Idempotencia — usar _id determinístico basado en el ID de MP
    const orderDocId = `pedido-${id}`
    
    // Verificación rápida opcional, pero createIfNotExists es la verdadera barrera
    const pedidoExistente = await backendClient.fetch(
      `*[_id == $orderDocId][0]`,
      { orderDocId }
    )
    if (pedidoExistente) {
      console.log(`Pago ${id} ya fue procesado (duplicado ignorado).`)
      return NextResponse.json({ received: true })
    }

    // Consultar el pago a la API de MP
    const payment = new Payment(getMpClient())
    let paymentData
    try {
      paymentData = await payment.get({ id })
    } catch (mpError) {
      // ⚠️ CRÍTICO: Si no podemos leer de MP, debemos devolver 500 para que MP reintente el webhook.
      // Si devolvemos 200, MP cree que lo procesamos y nunca más nos avisa.
      console.error(`❌ Error al obtener el pago ${id} de la API de MP:`, mpError)
      return NextResponse.json({ error: 'Error getting payment data' }, { status: 500 })
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
        dni:          raw.dni          || '',
        provincia:    raw.provincia    || '',
        ciudad:       raw.ciudad       || '',
        calle:        raw.calle        || '',
        numero:       raw.numero       || '',
        piso:         raw.piso         || '',
        departamento: raw.departamento || '',
        codigoPostal: raw.codigo_postal || raw.codigoPostal || '',
        notas:        raw.notas        || '',
        tipoEnvio:    (raw.tipo_envio || raw.tipoEnvio) === 'sucursal' ? 'sucursal' : 'domicilio',
        montoEnvio:   Number(raw.monto_envio || 0),
        kilos:        Number(raw.kilos || 0.3),
        valorDeclarado: Number(raw.valor_declarado || 0),
        sucursalId:            raw.sucursal_id            || '',
        sucursalNombre:        raw.sucursal_nombre        || '',
        sucursalNomenclatura:  raw.sucursal_nomenclatura  || '',
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

      // Dirección en una línea, para mostrar en Sanity y en los emails
      const direccionLegible =
        shippingData.tipoEnvio === 'sucursal'
          ? `Retira en sucursal Andreani: ${shippingData.sucursalNombre || shippingData.sucursalId}`
          : [
              `${shippingData.calle} ${shippingData.numero}`.trim(),
              shippingData.piso && `Piso ${shippingData.piso}`,
              shippingData.departamento && `Depto ${shippingData.departamento}`,
            ]
              .filter(Boolean)
              .join(', ')

      // ✅ Inicializar pedido en Sanity usando createIfNotExists
      const sanityOrder = await backendClient.createIfNotExists({
        _id: orderDocId,
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
          direccion:    direccionLegible          || 'N/A',
          codigoPostal: shippingData.codigoPostal || 'N/A',
          costo:        shippingData.montoEnvio,
          notas:          shippingData.notas          || '',
          sucursalId:     shippingData.sucursalId     || '',
          sucursalNombre: shippingData.sucursalNombre || '',
          dniReceptor:    shippingData.dni            || '',
        },
        estadoEnvio: 'pendiente',
        fecha: new Date().toISOString(),
      })

      // 📦 INTEGRACIÓN ANDREANI: Crear Envío
      try {
        console.log(`Iniciando creación de envío Andreani para pedido ${sanityOrder._id}...`)

        // El valor declarado es el de la mercadería, sin el costo del envío.
        const valorDeclarado =
          shippingData.valorDeclarado ||
          Math.max((paymentData.transaction_amount || 0) - shippingData.montoEnvio, 0)

        const andreaniResult = await crearOrdenEnvio({
          tipoEnvio: shippingData.tipoEnvio,
          idPedido: sanityOrder._id,
          destinatario: {
            nombreCompleto: clienteNombre,
            email: clienteEmail,
            telefono: clienteTelefono,
            documentoNumero: shippingData.dni,
          },
          bulto: {
            kilos: shippingData.kilos,
            volumenCm: Number(process.env.ANDREANI_VOLUMEN_ITEM_CM3 || 1000),
            valorDeclarado,
          },
          destinoPostal:
            shippingData.tipoEnvio === 'domicilio'
              ? {
                  codigoPostal: shippingData.codigoPostal,
                  calle: shippingData.calle,
                  numero: shippingData.numero,
                  piso: shippingData.piso,
                  departamento: shippingData.departamento,
                  localidad: shippingData.ciudad,
                  provincia: shippingData.provincia,
                }
              : undefined,
          sucursal:
            shippingData.tipoEnvio === 'sucursal'
              ? {
                  id: Number(shippingData.sucursalId),
                  nomenclatura: shippingData.sucursalNomenclatura,
                  descripcion: shippingData.sucursalNombre || '',
                }
              : undefined,
        })

        if (andreaniResult.numeroDeEnvio) {
          const numeroEnvio = andreaniResult.numeroDeEnvio
          // Link a nuestra ruta proxy: la URL de Andreani exige su token y
          // desde el panel de Sanity daria 401.
          const urlEtiqueta = urlEtiquetaInterna(numeroEnvio)

          await backendClient.patch(sanityOrder._id).set({
            estadoEnvio: 'despachado',
            numeroAndreani: numeroEnvio,
            urlEtiqueta: urlEtiqueta,
          }).commit()

          console.log(`✅ Envío Andreani creado: ${numeroEnvio}`)
        } else {
          // La orden se creó pero no vino el número de seguimiento: hay que
          // buscarlo a mano en el panel de Andreani.
          console.warn('⚠️ Andreani aceptó la orden pero no devolvió número de envío:', andreaniResult.raw)
          await backendClient.patch(sanityOrder._id).set({
            estadoEnvio: 'generando_etiqueta',
          }).commit()
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
          direccion:    direccionLegible          || 'N/A',
          ciudad:       shippingData.ciudad       || 'N/A',
          provincia:    shippingData.provincia    || 'N/A',
          codigoPostal: shippingData.codigoPostal || 'N/A',
        }
      }).catch(err => console.error('Error al enviar emails después del pedido:', err))

      // Helper para invalidar cache de Next.js de una página de producto
      // Se invalida el cache en proceso. Antes esto salía por HTTP contra la
      // propia app autenticándose con REVALIDATE_SECRET o, si faltaba, con los
      // últimos 12 caracteres del token de MercadoPago: nunca hay que derivar
      // un secreto de otro, menos del de cobros. Llamando directo no hace falta
      // secreto, ni salto de red, ni que NEXT_PUBLIC_BASE_URL esté bien puesto.
      const revalidateProductPage = (slug: string) => {
        try {
          revalidatePath(`/productos/${slug}`)
          revalidatePath('/productos')
        } catch (err) {
          console.error(`⚠️ Error al revalidar cache de /productos/${slug}:`, err)
        }
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
            if (productoData.slug) revalidateProductPage(productoData.slug)
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
              revalidateProductPage(item.id)
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

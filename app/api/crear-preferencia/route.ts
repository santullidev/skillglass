import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'
import { backendClient } from '@/lib/sanity'
import { cotizarEnvio, construirBulto, type TipoEnvio } from '@/lib/andreani'
import { getCostoEnvioPorCP } from '@/lib/shipping-fallback'

// ✅ FIX 1: Validar env var al inicio, falla claro si no está configurada
const accessToken = process.env.MP_ACCESS_TOKEN
if (!accessToken) {
  throw new Error('MP_ACCESS_TOKEN no está configurado en las variables de entorno')
}

const client = new MercadoPagoConfig({ accessToken })

// ✅ FIX 2: Interface limpia con un solo nombre por campo (estandarizado a MP)
interface CartItem {
  id?: string
  slug?: string
  nombre?: string       // legacy — se sigue soportando
  title?: string
  precio?: number       // legacy — se sigue soportando
  unit_price?: number
  cantidad?: number
  imagenUrl?: string    // legacy — se sigue soportando
  picture_url?: string
  numeroCertificado?: string
  peso?: number         // ✅ FIX 3: Agregar campo peso
}

// ✅ FIX 2b: Tipo del item ya normalizado para MP (evita el `any` en el webhook)
interface MpItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  currency_id: string
  picture_url?: string
  numeroCertificado?: string
  peso?: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const requestItems: CartItem[] = body.items || [
      {
        nombre: body.nombre,
        precio: body.precio,
        slug: body.slug,
        cantidad: 1,
      }
    ]

    // ✅ FIX 3: Usar NEXT_PUBLIC_BASE_URL con fallback explícito y log de advertencia
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.warn('⚠️ NEXT_PUBLIC_BASE_URL no está configurado. El webhook no funcionará en producción.')
    }
    const resolvedBaseUrl = baseUrl || 'http://localhost:3000'

    // ✅ FIX: Verificar precios reales y disponibilidad contra Sanity (CRIT-2)
    const productIds = requestItems.map(item => item.id).filter(Boolean) as string[]
    const realProducts = await backendClient.fetch(
      `*[_type == "producto" && _id in $ids]{ _id, precio, disponible, peso, nombre }`,
      { ids: productIds }
    )

    const mpItems: MpItem[] = requestItems.map((item) => {
      const realProduct = realProducts.find((p: any) => p._id === item.id)
      
      if (!realProduct) {
        throw new Error(`Producto no encontrado: ${item.id}`)
      }
      
      if (!realProduct.disponible) {
        throw new Error(`Producto no disponible: ${realProduct.nombre}`)
      }

      return {
        id: realProduct._id,
        title: realProduct.nombre || 'Producto SKILLGLASS',
        quantity: Number(item.cantidad || 1),
        unit_price: Number(realProduct.precio || 0), // PRECIO REAL, NO DEL CLIENTE
        currency_id: 'ARS',
        picture_url: item.imagenUrl || item.picture_url,
        numeroCertificado: item.numeroCertificado,
        peso: realProduct.peso || 300
      }
    })

    // ✅ El costo de envío SIEMPRE se recalcula acá (CRIT-1): lo que manda el
    // cliente es sólo informativo, nunca se usa para cobrar.
    const shippingData = body.shippingData || {}
    const cpDestino = String(shippingData.codigoPostal || '').replace(/\D/g, '')
    const tipoEnvio: TipoEnvio = shippingData.tipoEnvio === 'sucursal' ? 'sucursal' : 'domicilio'

    if (!cpDestino) {
      return NextResponse.json({ error: 'Campo inválido o faltante: codigoPostal' }, { status: 400 })
    }

    const bulto = construirBulto(
      mpItems.map((item) => ({
        peso: item.peso,
        cantidad: item.quantity,
        precio: item.unit_price,
      }))
    )

    let montoEnvio: number
    let cotizacionEsFallback = false

    try {
      const [cotizacion] = await cotizarEnvio(cpDestino, bulto, [tipoEnvio])
      if (!cotizacion) throw new Error(`Andreani no devolvió tarifa para envío a ${tipoEnvio}`)
      montoEnvio = cotizacion.tarifa
    } catch (e) {
      console.warn(
        `⚠️ Cotización de Andreani falló, se usa la tabla fija:`,
        e instanceof Error ? e.message : String(e)
      )
      const zona = getCostoEnvioPorCP(cpDestino)
      montoEnvio = tipoEnvio === 'sucursal' ? zona.costoSucursal : zona.costoADomicilio
      cotizacionEsFallback = true
    }

    if (montoEnvio > 0) {
      mpItems.push({
        id: 'shipping_andreani',
        title: tipoEnvio === 'sucursal' ? 'Envío Andreani a sucursal' : 'Envío Andreani a domicilio',
        quantity: 1,
        unit_price: montoEnvio,
        currency_id: 'ARS',
      })
    }

    // ✅ FIX 5: Validación robusta del lado servidor
    const validateServerField = (name: string, value: any) => {
      const v = String(value || '').trim()
      if (name === 'nombre') return v.split(' ').filter(Boolean).length >= 2
      if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      if (name === 'telefono') return v.replace(/\D/g, '').length >= 10
      if (name === 'codigoPostal') return /^\d{4}([A-Za-z]{3})?$/.test(v)
      // Andreani exige el DNI del receptor para entregas B2C
      if (name === 'dni') return /^\d{7,8}$/.test(v.replace(/\D/g, ''))
      if (name === 'numero') return v.length >= 1
      if (name === 'sucursalId') return v.length >= 1
      return v.length >= 2
    }

    // Los campos requeridos dependen del tipo de envío: a sucursal no hace falta
    // la dirección del cliente, pero sí la sucursal elegida.
    const requiredFields =
      tipoEnvio === 'sucursal'
        ? ['nombre', 'email', 'telefono', 'dni', 'provincia', 'ciudad', 'codigoPostal', 'sucursalId']
        : ['nombre', 'email', 'telefono', 'dni', 'provincia', 'ciudad', 'codigoPostal', 'calle', 'numero']

    for (const field of requiredFields) {
      if (!validateServerField(field, shippingData[field])) {
        return NextResponse.json({ error: `Campo inválido o faltante: ${field}` }, { status: 400 })
      }
    }

    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${resolvedBaseUrl}/pago/exitoso`,
          failure: `${resolvedBaseUrl}/carrito`,
          pending: `${resolvedBaseUrl}/pago/pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${resolvedBaseUrl}/api/webhook/mercadopago`,
        external_reference: `order_${Date.now()}`,
        // Payer information if available
        payer: {
          name: shippingData.nombre,
          email: shippingData.email,
          phone: {
            number: shippingData.telefono,
          },
        },
        // ✅ Metadata completo con items y datos de envío
        // ⚠️ MP pasa todas las keys a snake_case: el webhook las lee así.
        metadata: {
          shipping_data: {
            ...shippingData,
            tipo_envio: tipoEnvio,
            monto_envio: montoEnvio,
            cotizacion_fallback: cotizacionEsFallback,
            kilos: bulto.kilos,
            valor_declarado: bulto.valorDeclarado,
          },
          items: mpItems.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            numero_certificado: item.numeroCertificado || null,
            peso: item.peso || 300,
          })),
        },
      },
    })

    return NextResponse.json({ url: response.init_point, id: response.id })

  } catch (error) {
  console.error('MP Error al crear preferencia:', error)
  return NextResponse.json(
    { 
      error: 'Error al crear la preferencia de pago',
      detail: error instanceof Error ? error.message : String(error)  // 👈 agregar esto
    },
    { status: 500 }
  )
}
}
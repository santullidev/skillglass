import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'
import { backendClient } from '@/lib/sanity'
import { cotizarEnvio, construirBulto, type TipoEnvio } from '@/lib/andreani'
import { getCostoEnvioPorCP } from '@/lib/shipping-fallback'
import { validarCarrito } from '@/lib/cart-validation'
import { errorInterno } from '@/lib/api-errors'

const accessToken = process.env.MP_ACCESS_TOKEN

// El cliente se crea perezosamente: lanzar en el módulo tumba toda la ruta
// (y el build) en vez de devolver un error manejable.
let mpClient: MercadoPagoConfig | null = null
function getMpClient(): MercadoPagoConfig {
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN no está configurado en las variables de entorno')
  }
  mpClient ??= new MercadoPagoConfig({ accessToken })
  return mpClient
}

// Tipo del item ya normalizado para MP (evita el `any` en el webhook)
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

interface ProductoSanity {
  _id: string
  precio?: number
  disponible?: boolean
  peso?: number
  nombre?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ✅ Del cliente sólo se acepta el id y la cantidad, ya validados.
    const validacion = validarCarrito(body.items)
    if (!validacion.ok) {
      return NextResponse.json({ error: validacion.error }, { status: 400 })
    }
    const lineas = validacion.lineas

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.warn('⚠️ NEXT_PUBLIC_BASE_URL no está configurado. El webhook no funcionará en producción.')
    }
    const resolvedBaseUrl = baseUrl || 'http://localhost:3000'

    // ✅ Precio, peso y disponibilidad SIEMPRE desde Sanity (CRIT-2)
    const realProducts: ProductoSanity[] = await backendClient.fetch(
      `*[_type == "producto" && _id in $ids]{ _id, precio, disponible, peso, nombre }`,
      { ids: lineas.map((l) => l.id) }
    )

    const mpItems: MpItem[] = []

    for (const linea of lineas) {
      const realProduct = realProducts.find((p) => p._id === linea.id)

      if (!realProduct) {
        return NextResponse.json({ error: 'Una de las piezas ya no está disponible' }, { status: 409 })
      }
      if (!realProduct.disponible) {
        return NextResponse.json(
          { error: `"${realProduct.nombre?.trim() || 'La pieza elegida'}" ya no está disponible` },
          { status: 409 }
        )
      }

      const precio = Number(realProduct.precio)
      if (!Number.isFinite(precio) || precio <= 0) {
        console.error(`Producto ${realProduct._id} tiene un precio inválido en Sanity:`, realProduct.precio)
        return NextResponse.json({ error: 'Una de las piezas tiene un precio inválido' }, { status: 409 })
      }

      mpItems.push({
        id: realProduct._id,
        title: realProduct.nombre?.trim() || 'Producto SKILGLASS',
        quantity: linea.cantidad,
        unit_price: precio, // PRECIO REAL, NO DEL CLIENTE
        currency_id: 'ARS',
        picture_url: linea.imagenUrl,
        numeroCertificado: linea.numeroCertificado,
        peso: Number(realProduct.peso) > 0 ? Number(realProduct.peso) : 300,
      })
    }

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

    const preference = new Preference(getMpClient())
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
    return errorInterno(
      'crear-preferencia',
      error,
      'No pudimos iniciar el pago. Intentá de nuevo en unos minutos.'
    )
  }
}
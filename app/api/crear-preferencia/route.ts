import { NextRequest, NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

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

    const mpItems: MpItem[] = requestItems.map((item) => ({
      id: item.id || item.slug || 'N/A',
      title: item.nombre || item.title || 'Producto SKILLGLASS',
      quantity: Number(item.cantidad || 1),
      unit_price: Number(item.precio || item.unit_price || 0),
      currency_id: 'ARS',
      picture_url: item.imagenUrl || item.picture_url,
      numeroCertificado: item.numeroCertificado
    }))

    const shippingData = body.shippingData || {}

    // ✅ FIX 5: Validación robusta del lado servidor
    const validateServerField = (name: string, value: any) => {
      const v = String(value || '').trim()
      if (name === 'nombre') return v.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(v) && v.split(' ').length >= 2
      if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      if (name === 'telefono') return v.replace(/\D/g, '').length >= 10
      if (name === 'codigoPostal') return /^\d{4}([A-Z]{3})?$/.test(v)
      if (name === 'provincia' || name === 'ciudad' || name === 'direccion') return v.length >= 2
      return true
    }

    const requiredFields = ['nombre', 'email', 'telefono', 'provincia', 'ciudad', 'codigoPostal', 'direccion']
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
        metadata: {
          shipping_data: {
            ...shippingData
          },
          items: mpItems.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            numero_certificado: item.numeroCertificado || null,
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
import { NextRequest, NextResponse } from 'next/server'
import { cotizarEnvio, construirBulto, type TipoEnvio } from '@/lib/andreani'
import { getCostoEnvioPorCP } from '@/lib/shipping-fallback'
import { rateLimit, obtenerIp } from '@/lib/rate-limit'
import { MAX_LINEAS, MAX_UNIDADES_POR_LINEA } from '@/lib/cart-validation'

/**
 * Cada cotización pega contra la API de Andreani. Sin techo, cualquiera puede
 * variar el CP indefinidamente y quemarnos la cuota o hacer que nos corten el
 * servicio. El checkout cotiza con debounce, así que un cliente real hace
 * pocas por minuto.
 */
const LIMITE_COTIZACIONES = 40
const VENTANA_MS = 60 * 1000

/**
 * Cotiza el envío para el carrito actual.
 * Devuelve una opción por tipo de envío (domicilio y sucursal).
 */
export async function POST(req: NextRequest) {
  let cpDestino = ''

  const limite = rateLimit(`cotizar:${obtenerIp(req)}`, LIMITE_COTIZACIONES, VENTANA_MS)
  if (!limite.permitido) {
    return NextResponse.json(
      { error: 'Demasiadas consultas seguidas. Esperá unos segundos.' },
      { status: 429, headers: { 'Retry-After': String(limite.reintentarEn) } }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
    }

    cpDestino = String(body.cpDestino || '').trim()
    const { items } = body

    if (!/^\d{4}([A-Za-z]{3})?$/.test(cpDestino)) {
      return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }
    if (items.length > MAX_LINEAS) {
      return NextResponse.json({ error: 'Demasiadas piezas en el carrito' }, { status: 400 })
    }

    // Esta cotización es sólo para mostrar: el monto que se cobra se recalcula
    // en crear-preferencia con los precios reales de Sanity. Aun así se acotan
    // los valores para que un carrito manipulado no genere pedidos absurdos
    // contra Andreani.
    const itemsAcotados = items.map((item: Record<string, unknown>) => ({
      peso: Math.min(Math.max(Number(item?.peso) || 300, 1), 50_000),
      cantidad: Math.min(Math.max(Math.trunc(Number(item?.cantidad) || 1), 1), MAX_UNIDADES_POR_LINEA),
      precio: Math.min(Math.max(Number(item?.precio) || 0, 0), 100_000_000),
    }))

    const bulto = construirBulto(itemsAcotados)
    const cotizaciones = await cotizarEnvio(cpDestino.replace(/\D/g, ''), bulto)

    if (cotizaciones.length === 0) {
      throw new Error('Andreani no devolvió ninguna tarifa')
    }

    return NextResponse.json({
      success: true,
      cotizaciones,
      detalles: { kilos: bulto.kilos, valorDeclarado: bulto.valorDeclarado },
    })
  } catch (error) {
    console.warn(
      'Andreani no disponible, usando tabla de costos fija:',
      error instanceof Error ? error.message : String(error)
    )

    // Fallback: sólo si la API de Andreani está caída. Los valores de la tabla son
    // estimaciones conservadoras para no cobrar de menos.
    const zona = getCostoEnvioPorCP(cpDestino || '1000')

    const opciones: { tipo: TipoEnvio; tarifa: number }[] = [
      { tipo: 'domicilio', tarifa: zona.costoADomicilio },
      { tipo: 'sucursal', tarifa: zona.costoSucursal },
    ]

    return NextResponse.json({
      success: true,
      fallback: true,
      cotizaciones: opciones.map((o) => ({ ...o, contrato: '', distribucion: 0, seguro: 0, pesoAforado: 0 })),
      detalles: {
        zona: zona.zona,
        mensaje: 'Costo estimado por zona. El costo final puede variar.',
      },
    })
  }
}

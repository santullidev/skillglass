import { NextRequest, NextResponse } from 'next/server'
import { cotizarEnvio, construirBulto, type TipoEnvio } from '@/lib/andreani'
import { getCostoEnvioPorCP } from '@/lib/shipping-fallback'

/**
 * Cotiza el envío para el carrito actual.
 * Devuelve una opción por tipo de envío (domicilio y sucursal).
 */
export async function POST(req: NextRequest) {
  let cpDestino = ''

  try {
    const body = await req.json()
    cpDestino = String(body.cpDestino || '').trim()
    const { items } = body

    if (!/^\d{4}([A-Za-z]{3})?$/.test(cpDestino)) {
      return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const bulto = construirBulto(items)
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

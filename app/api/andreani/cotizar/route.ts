import { NextRequest, NextResponse } from 'next/server';
import { cotizarEnvio } from '@/lib/andreani';

export async function POST(req: NextRequest) {
  let cpDestino = ''
  try {
    const body = await req.json()
    cpDestino = body.cpDestino || ''
    const { items } = body

    if (!cpDestino || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'CP y productos son requeridos' }, { status: 400 });
    }

    // Calcular peso total (usando el campo 'peso' o un default de 300g)
    // El 'valorDeclarado' es la suma de los precios para el seguro
    let pesoTotal = 0;
    let valorTotal = 0;

    items.forEach((item: any) => {
      const cantidad = Number(item.cantidad || 1);
      const pesoUnidad = Number(item.peso || 300); // Fallback a 300g
      const precioUnidad = Number(item.precio || item.unit_price || 0);
      
      pesoTotal += pesoUnidad * cantidad;
      valorTotal += precioUnidad * cantidad;
    });

    // Consultar a Andreani
    const cotizaciones = await cotizarEnvio(cpDestino, pesoTotal, valorTotal);

    return NextResponse.json({ 
      success: true, 
      cotizaciones,
      detalles: { pesoTotal, valorTotal }
    });

  } catch (error) {
    console.warn('Andreani no disponible, usando tabla de costos fija:', error instanceof Error ? error.message : String(error));
    
    // Fallback: tabla estática de costos por CP
    const { getCostoEnvioPorCP } = await import('@/lib/shipping-fallback');
    const zona = getCostoEnvioPorCP(cpDestino || '1000');
    
    return NextResponse.json({
      success: true,
      fallback: true, // indica que se usó la tabla fija
      cotizaciones: [
        {
          tipo: 'domicilio',
          tarifa: zona.costoADomicilio,
          diasEntrega: zona.diasEstimados,
        },
        {
          tipo: 'sucursal',
          tarifa: zona.costoSucursal,
          diasEntrega: zona.diasEstimados,
        },
      ],
      detalles: { zona: zona.zona, mensaje: 'Costo estimado por zona. El costo final puede variar.' }
    });
  }
}

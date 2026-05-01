import { client } from '@/lib/sanity'
import { PRODUCTOS_QUERY, PRODUCTOS_SECTION_QUERY, PROCESO_SECTION_QUERY, SETTINGS_QUERY } from '@/lib/queries'
import CatalogClient from '@/components/CatalogClient'
import type { Producto } from '@/types/producto'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo de Piezas Únicas | SKILGLASS',
  description: 'Explora nuestra colección de joyería de autor y piezas escultóricas en joyería en vidrio. Maestría en la refracción de la luz y el cristal fundido.',
}

export const revalidate = 60 // Revalidate every minute

export default async function ProductosPage() {
  const [productos, productosConfig, procesoConfig, settings] = await Promise.all([
    client.fetch<Producto[]>(PRODUCTOS_QUERY),
    client.fetch(PRODUCTOS_SECTION_QUERY),
    client.fetch(PROCESO_SECTION_QUERY),
    client.fetch(SETTINGS_QUERY)
  ])

  const descripcionHero = productosConfig?.descripcion || 'Cada joya es un fragmento de luz congelada, esculpida a través del calor extremo para capturar la fluidez orgánica del cristal en su estado más puro.'

  return (
    <div className="min-h-screen bg-surface-deep">
      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Header Section */}
      <header className="mb-20 lg:mb-32 relative">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-gold/10 mb-16">
          <div className="flex flex-col items-start gap-4 flex-1">
            <p className="text-gold text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-700 hover:direction-rtl" style={{ fontFamily: 'var(--font-label)' }}>
              Colección Completa
            </p>
            <h1 className="text-6xl lg:text-8xl text-on-surface leading-[0.9]" style={{ fontFamily: 'var(--font-display)' }}>
              Piezas de <br />
              <span className="italic font-serif text-gradient-gold">Alquimia</span>
            </h1>
          </div>

          <div className="flex-1 max-w-lg">
            <p className="text-on-surface-variant font-serif text-lg leading-relaxed italic mb-8 border-l-2 border-gold/20 pl-6">
              {descripcionHero}
            </p>
            
            <div className="flex items-center gap-6 text-[10px] tracking-[0.3em] uppercase text-outline-variant" style={{ fontFamily: 'var(--font-label)' }}>
              <div className="flex flex-col gap-1">
                <span className="text-gold font-black text-2xl leading-none">{productos.length}</span>
                <span className="opacity-60 whitespace-nowrap">Objetos Disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CATALOG CLIENT (FILTERS + ASYMMETRIC GRID) --- */}
        <CatalogClient 
          initialProductos={productos} 
          procesoConfig={procesoConfig}
          settings={settings}
        />
      </header>
      </div>
    </div>
  )
}

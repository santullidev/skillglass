import { client } from '@/lib/sanity'
import { PRODUCTOS_QUERY } from '@/lib/queries'
import ProductCard from '@/components/ProductCard'
import type { Producto } from '@/types/producto'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo de Piezas Únicas | SKILGLASS',
  description: 'Explora nuestra colección de joyería de autor y piezas escultóricas en vitrofusión. Maestría en la refracción de la luz y el cristal fundido.',
}

export const revalidate = 60 // Revalidate every minute

export default async function ProductosPage() {
  const productos: Producto[] = await client.fetch(PRODUCTOS_QUERY)

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-16 lg:mb-24 relative overflow-hidden">
        <div className="absolute -left-12 top-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
        
        <div className="flex flex-col items-start gap-4 mb-8">
          <p className="text-secondary text-xs tracking-[0.3em] font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
            Colección Completa
          </p>
          <h1 className="text-5xl lg:text-7xl text-on-surface leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Piezas de <br />
            <span className="italic font-serif">Alquimia Lumínica</span>
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l border-outline-variant/30 pl-8 ml-2">
          <p className="max-w-xl text-on-surface-variant font-serif text-lg leading-relaxed">
            Cada joya en este catálogo ha sido esculpida mediante procesos de transformación térmica, capturando la fluidez orgánica del cristal en su estado más puro. Series limitadas y piezas de autor.
          </p>
          
          <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-outline-variant" style={{ fontFamily: 'var(--font-label)' }}>
            <span className="text-primary font-bold">{productos.length}</span>
            <span>Objetos de Arte Disponibles</span>
          </div>
        </div>
      </header>

      {/* Product Grid */}
      {productos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {productos.map((producto, index) => (
            <ProductCard 
              key={producto._id} 
              producto={producto} 
              index={index} // Priority for the first row
            />
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center gap-4 border border-outline-variant/20 bg-surface-container-low">
          <p className="text-on-surface-variant font-serif italic text-xl">
            Nuestros hornos están trabajando...
          </p>
          <p className="text-xs uppercase tracking-widest text-outline-variant" style={{ fontFamily: 'var(--font-label)' }}>
            Vuelve pronto para nuevas piezas.
          </p>
        </div>
      )}

      {/* Footer Decoration */}
      <div className="mt-32 w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent" />
    </div>
  )
}

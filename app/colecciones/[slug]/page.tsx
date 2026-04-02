import { client } from '@/lib/sanity'
import { COLECCION_BY_SLUG_QUERY } from '@/lib/queries'
import { notFound } from 'next/navigation'
import type { Coleccion } from '@/types/producto'
import ProductCard from '@/components/ProductCard'
import ImageCarousel from '@/components/ImageCarousel'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const coleccion = await client.fetch<Coleccion>(COLECCION_BY_SLUG_QUERY, { slug: resolvedParams.slug })
  
  if (!coleccion) return { title: 'No encontrado' }

  return {
    title: `${coleccion.nombre} | Colección SKILGLASS`,
    description: coleccion.descripcion || `Explora las piezas únicas de la colección ${coleccion.nombre}.`,
  }
}

export default async function ColeccionDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params
  const coleccion = await client.fetch<Coleccion>(COLECCION_BY_SLUG_QUERY, { slug: resolvedParams.slug })

  if (!coleccion) {
    notFound()
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant mb-12" style={{ fontFamily: 'var(--font-label)' }}>
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="text-outline-variant">/</span>
        <Link href="/colecciones" className="hover:text-primary transition-colors">Colecciones</Link>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface truncate max-w-[200px]">{coleccion.nombre}</span>
      </nav>

      {/* Collection Header (Editorial Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24 relative">
        <div className="relative z-10">
          <p className="label-text mb-4 text-primary">COLECCIÓN EXCLUSIVA</p>
          <h1 className="text-5xl lg:text-7xl text-on-surface mb-8 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {coleccion.nombre}
          </h1>
          
          <div className="text-on-surface-variant space-y-6 text-lg leading-relaxed max-w-xl font-serif">
            {coleccion.descripcionLarga ? (
              // Split by double newline for basic paragraphs
              coleccion.descripcionLarga.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>{coleccion.descripcion}</p>
            )}
          </div>
        </div>

        {/* Carousel Column */}
        {coleccion.imagenes && coleccion.imagenes.length > 0 && (
          <div className="relative">
            <ImageCarousel images={coleccion.imagenes} alt={`Colección ${coleccion.nombre}`} />
            {/* Absolute accent border to fulfill Stitch zero-radius design system */}
            <div className="absolute -inset-4 border border-outline-variant/10 pointer-events-none hidden lg:block" />
          </div>
        )}
        
        {/* Glow effect behind header */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      </div>

      <div className="border-t border-outline-variant/20 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-3xl lg:text-4xl text-on-surface" style={{ fontFamily: 'var(--font-display)' }}>
            Piezas Molten
          </h2>
          <div className="text-on-surface-variant text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-label)' }}>
            {coleccion.productos?.length || 0} Resultados
          </div>
        </div>

        {/* Products Bento Grid */}
        {coleccion.productos && coleccion.productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/10 border border-outline-variant/10 grid-auto-flow-dense">
            {coleccion.productos.map((item) => {
              const { producto, tamanoGrilla } = item
              
              // Mapping sizes to grid spans
              let gridClasses = "col-span-1 row-span-1"
              if (tamanoGrilla === 'doble_ancho') gridClasses = "col-span-1 md:col-span-2 row-span-1"
              if (tamanoGrilla === 'doble_alto') gridClasses = "col-span-1 row-span-2"
              if (tamanoGrilla === 'destacado') gridClasses = "col-span-1 md:col-span-2 row-span-2"

              return (
                <div key={item._key} className={`${gridClasses} min-h-[400px] bg-surface`}>
                  <ProductCard producto={producto} />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface-container/30 border border-outline-variant/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />
            <p className="text-on-surface-variant font-serif italic text-lg relative z-10">
              Las piezas de esta colección están siendo esculpidas actualmente. Vuelve pronto.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

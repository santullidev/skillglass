import { client } from '@/lib/sanity'
import { COLECCIONES_QUERY } from '@/lib/queries'
import type { Coleccion } from '@/types/producto'
import CollectionCard from '@/components/CollectionCard'
import type { Metadata } from 'next'

export const revalidate = 60 // Revalidate every minute

export const metadata: Metadata = {
  title: 'Cápsulas | SKILGLASS',
  description: 'Explora nuestras cápsulas exclusivas de joyería en vidrio. Piezas capturadas en el instante exacto de la luz molten.',
  openGraph: {
    title: 'Cápsulas de Joyería de Autor | SKILGLASS',
    description: 'Series conceptuales de joyería molten.',
    url: 'https://skillglass.com/capsulas',
    siteName: 'SKILGLASS',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cápsulas | SKILGLASS',
    description: 'Explora nuestras cápsulas exclusivas de joyería en vidrio.',
  }
}

export default async function ColeccionesPage() {
  const colecciones = await client.fetch<Coleccion[]>(COLECCIONES_QUERY)

  return (
    <div className="min-h-screen bg-surface dark" style={{ fontFamily: 'var(--font-body)' }}>
      {/* HEADER EDITORIAL */}
      <section className="pt-32 pb-16 px-6 lg:px-8 border-b border-white/5 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-linear-to-b from-surface-deep to-surface pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl text-on-surface"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Cápsulas
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Series conceptuales que exploran el estado viscoso y la refracción lumínica. 
            Cada cápsula encapsula un instante de transformación térmica.
          </p>
        </div>
      </section>

      {/* GRID DE CÁPSULAS */}
      <section className="py-24 px-6 lg:px-8">
        {colecciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-360 mx-auto">
            {colecciones.map((coleccion) => (
              <CollectionCard key={coleccion._id} coleccion={coleccion} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-gold text-xs tracking-widest uppercase font-bold" style={{ fontFamily: 'var(--font-label)' }}>
              Próximamente
            </span>
            <p className="mt-4 text-on-surface-variant">
              Nuestras nuevas cápsulas están actualmente en el horno.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

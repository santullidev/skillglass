import { client } from '@/lib/sanity'
import { COLECCIONES_QUERY } from '@/lib/queries'
import type { Coleccion } from '@/types/producto'
import CollectionCard from '@/components/CollectionCard'
import type { Metadata } from 'next'

export const revalidate = 60 // Revalidate every minute

export const metadata: Metadata = {
  title: 'Colecciones | SKILGLASS',
  description: 'Explora nuestras colecciones exclusivas de joyería en vidrio. Piezas capturadas en el instante exacto de la luz molten.',
  openGraph: {
    title: 'Colecciones de Joyería de Autor | SKILGLASS',
    description: 'Series limitadas esculpidas al fuego, capturando la fluidez del cristal.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colecciones | SKILGLASS',
    description: 'Joyas esculpidas por el fuego, capturando la fluidez del cristal.',
  },
}

export default async function ColeccionesPage() {
  const colecciones = await client.fetch<Coleccion[]>(COLECCIONES_QUERY)

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16 relative z-10">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl text-on-surface mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Colecciones
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl">
            Explorando el límite térmico del cristal. Piezas formadas en series limitadas y agrupadas por el carácter de su transformación en la flama.
          </p>
        </div>

        {/* Collections Grid */}
        {colecciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/20 border border-outline-variant/20">
            {colecciones.map((coleccion) => (
              <CollectionCard key={coleccion._id} coleccion={coleccion} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-outline-variant/20">
            <p className="text-on-surface-variant font-serif italic text-lg">No hay colecciones disponibles aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}

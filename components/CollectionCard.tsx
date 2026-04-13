import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { Coleccion } from '@/types/producto'

interface Props {
  coleccion: Coleccion
}

export default function CollectionCard({ coleccion }: Props) {
  // Use first image as cover
  const coverImageUrl = coleccion.imagenes?.[0]
    ? urlFor(coleccion.imagenes[0]).width(800).height(800).fit('crop').url()
    : '/hero-bg.png' // Fallback to hero texture if no image is set

  const subtitle = coleccion.productos
    ? `${coleccion.productos.length} piezas`
    : 'Próximamente'

  return (
    <Link
      href={`/capsulas/${coleccion.slug}`}
      className="group block relative w-full aspect-4/5 bg-surface-container-lowest overflow-hidden border border-outline-variant/20 hover:border-primary/50 transition-colors duration-500"
    >
      {/* Background Image */}
      <Image
        src={coverImageUrl}
        alt={coleccion.nombre}
        fill
        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center text-center">
        <p className="label-text mb-3 tracking-widest text-primary">
          {subtitle}
        </p>
        <h2
          className="text-on-surface text-2xl lg:text-3xl mb-4 group-hover:text-tertiary transition-colors duration-300"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {coleccion.nombre}
        </h2>
        {coleccion.descripcion && (
          <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed line-clamp-2">
            {coleccion.descripcion}
          </p>
        )}
      </div>
    </Link>
  )
}

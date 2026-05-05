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
    ? urlFor(coleccion.imagenes[0]).width(900).height(1125).fit('crop').url() // 4:5 ratio
    : '/hero-bg.png'

  const subtitle = coleccion.productos
    ? `${coleccion.productos.length} piezas`
    : 'Próximamente'

  const isDark = (coleccion.textColor || 'white') === 'white'
  const textColorClass = isDark ? '!text-white' : '!text-black'
  const subtextColorClass = isDark ? '!text-white/70' : '!text-black/70'

  return (
    <Link
      href={`/capsulas/${coleccion.slug}`}
      className="group relative block w-full aspect-[4/5] bg-surface-container-low overflow-hidden transition-all duration-500"
    >
      {/* Background Image */}
      <Image
        src={coverImageUrl}
        alt={coleccion.nombre}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Gradient Overlay - Refined for elegance and readability */}
      <div 
        className={`absolute inset-0 z-10 transition-all duration-700 ${
          isDark 
            ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100' 
            : 'bg-white/20 opacity-100'
        }`} 
      />

      {/* Badge: Cápsula */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
        <span 
          className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] bg-gold !text-white px-3 py-1 rounded-full uppercase shadow-xl"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Cápsula
        </span>
      </div>

      {/* Info Container - Bottom Left alignment like ProductCard */}
      <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-end pointer-events-none">
        <div className="flex flex-col gap-1 md:gap-2">
          {/* Piece Count */}
          <p 
            className={`text-[10px] md:text-xs tracking-[0.3em] ${subtextColorClass} uppercase font-bold`}
            style={{ fontFamily: 'var(--font-label)' }}
          >
            {subtitle}
          </p>

          <div className="flex flex-col gap-1">
            {/* Collection Name */}
            <h2
              className={`${textColorClass} text-2xl md:text-3xl lg:text-4xl leading-tight font-medium drop-shadow-md`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {coleccion.nombre}
            </h2>

            {/* Short Description */}
            {coleccion.descripcion && (
              <p className={`${subtextColorClass} text-xs md:text-sm font-serif italic leading-relaxed max-w-[90%] line-clamp-2`}>
                {coleccion.descripcion}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

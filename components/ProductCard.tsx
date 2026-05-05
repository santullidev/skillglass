import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { Producto } from '@/types/producto'

interface Props {
  producto: Producto
  index?: number
}

export default function ProductCard({ producto, index = 0 }: Props) {
  const imagenUrl = producto.imagenes?.[0]
    ? urlFor(producto.imagenes[0]).width(900).height(1125).fit('crop').url() // 4:5 ratio
    : '/product-necklace.png'

  const safeSlug = typeof producto.slug === 'object' && producto.slug !== null
    ? (producto.slug as { current: string }).current
    : producto.slug

  const isDark = (producto.textColor || 'white') === 'white'
  const textColorClass = isDark ? 'text-white' : 'text-black'
  const subtextColorClass = isDark ? 'text-white/80' : 'text-black/80'

  return (
    <Link
      href={`/productos/${safeSlug}`}
      className="group relative block w-full aspect-[4/5] bg-surface-container-low overflow-hidden transition-all duration-500"
    >
      {/* Background Image */}
      <Image
        src={imagenUrl}
        alt={producto.nombre}
        fill
        className="object-cover transition-transform duration-400 ease-in-out group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 50vw, 33vw"
        priority={index < 4}
      />

      {/* Gradient Overlay - Deepened for maximum contrast */}
      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-500 bg-gradient-to-t ${
          isDark 
            ? 'from-black/90 via-black/40 to-transparent opacity-95' 
            : 'from-white/80 via-white/30 to-transparent opacity-90'
        } group-hover:opacity-100`}
      />

      {/* Badge: Pieza Única */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
        <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] bg-[#8B1A1A] !text-white px-3 py-1 rounded-full uppercase shadow-xl"
          style={{ fontFamily: 'var(--font-label)' }}>
          Pieza Única
        </span>
      </div>

      {/* Info Container - Forced to bottom */}
      <div className="absolute inset-0 z-20 p-5 md:p-8 flex flex-col justify-end pointer-events-none">
        <div className="flex flex-col gap-1 md:gap-2">
          {/* Category */}
          <p className={`text-[10px] md:text-xs tracking-[0.3em] ${subtextColorClass} uppercase font-bold`}
            style={{ fontFamily: 'var(--font-label)' }}>
            {producto.categoria || 'Joyería de autor'}
          </p>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
            {/* Name */}
            <h2
              className={`${textColorClass} text-2xl md:text-3xl lg:text-4xl leading-tight font-medium drop-shadow-md`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {producto.nombre}
            </h2>

            {/* Price */}
            {producto.precio && (
              <span
                className={`${textColorClass} text-sm md:text-base tracking-widest font-bold shrink-0 mb-1`}
                style={{ fontFamily: 'var(--font-label)' }}
              >
                ${producto.precio.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
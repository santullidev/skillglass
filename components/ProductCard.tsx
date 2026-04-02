import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { Producto } from '@/types/producto'

interface Props {
  producto: Producto
  variant?: 'normal' | 'featured' | 'tall' | 'stacked' | 'wide'
  index?: number
}

export default function ProductCard({ producto, variant = 'normal', index = 0 }: Props) {
  const imagenUrl = producto.imagenes?.[0]
    ? urlFor(producto.imagenes[0]).width(900).height(1100).fit('crop').url()
    : '/product-necklace.png'

  const safeSlug = typeof producto.slug === 'object' && producto.slug !== null
    ? (producto.slug as { current: string }).current
    : producto.slug

  const isFeatured = variant === 'featured'
  const isTall = variant === 'tall'
  const isStacked = variant === 'stacked'
  const isWide = variant === 'wide'

  return (
    <Link
      href={`/productos/${safeSlug}`}
      className={`group relative overflow-hidden block ${
        isFeatured ? 'col-span-2 row-span-2' :
        isTall     ? 'row-span-2' :
        isWide     ? 'col-span-2' : ''
      }`}
    >
      {/* Full-bleed image */}
      <div className={`relative w-full overflow-hidden bg-surface-container-low ${
        isFeatured ? 'h-[70vh]' :
        isTall     ? 'h-[60vh]' :
        isStacked  ? 'h-[35vh]' :
        isWide     ? 'h-[45vh]' :
                     'h-[50vh] md:h-[55vh]'
      }`}>
        <Image
          src={imagenUrl}
          alt={producto.nombre}
          fill
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 2}
        />

        {/* Iridescent edge */}
        <div className="absolute inset-0 border border-white/5 pointer-events-none z-10" />

        {/* Deep gradient from bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />

        {/* Caustic glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(169,199,255,0.12) 0%, transparent 65%)' }}
        />

        {/* Top-left index */}
        <div className="absolute top-4 left-4 z-20 opacity-40 group-hover:opacity-70 transition-opacity duration-300">
          <span className="text-[10px] tracking-[0.3em] text-white/60 font-bold"
            style={{ fontFamily: 'var(--font-label)' }}>
            {String(index + 1).padStart(2, '0')} {'//'}
          </span>
        </div>

        {/* Top-right badge: Edición Limitada */}
        {producto.esEdicionLimitada && (
          <div className="absolute top-4 right-4 z-20">
            <span className="text-[9px] tracking-[0.25em] text-primary border border-primary/40 px-2 py-1 uppercase"
              style={{ fontFamily: 'var(--font-label)', backdropFilter: 'blur(8px)', background: 'rgba(10,5,8,0.5)' }}>
              Ed. Limitada
            </span>
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 lg:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-[10px] tracking-[0.25em] text-white/40 uppercase mb-2"
            style={{ fontFamily: 'var(--font-label)' }}>
            Vitrofusión de autor
          </p>

          <div className="flex items-end justify-between gap-4">
            <h2
              className={`text-on-surface leading-tight ${isFeatured ? 'text-3xl' : 'text-xl'}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {producto.nombre}
            </h2>

            {producto.precio && (
              <span
                className="text-primary text-sm shrink-0 pb-0.5"
                style={{ fontFamily: 'var(--font-label)', letterSpacing: '0.05em' }}
              >
                ${producto.precio.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Subtle CTA line that slides up on hover */}
          <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <span className="flex-1 h-px bg-primary/40" />
            <span className="text-primary text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-label)' }}>
              Ver pieza
            </span>
            <span className="flex-1 h-px bg-primary/40" />
          </div>
        </div>
      </div>
    </Link>
  )
}
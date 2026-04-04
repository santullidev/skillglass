'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { HeroMetadata } from '@/types/producto'

interface SanityImage {
  _key?: string
  _type?: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

interface Props {
  images?: SanityImage[]
  metadata?: HeroMetadata
  title?: string
  subtitle?: string
}

export default function HeroSlider({ images, metadata, title, subtitle }: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 6000)
    
    return () => clearInterval(interval)
  }, [images])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-surface-lowest">
      {/* Background Images */}
      <div className="absolute inset-0 z-0 bg-surface-lowest">
        {images && images.length > 0 ? (
          images.map((img, i) => (
            <Image
              key={img._key || i}
              src={urlFor(img).width(1920).height(1080).url()}
              alt={`Vitrofusión Hero ${i + 1}`}
              fill
              className={`object-cover transition-opacity duration-1500 ease-in-out ${
                i === index ? 'opacity-60 z-10' : 'opacity-0 z-0'
              }`}
              priority={i === 0}
              sizes="100vw"
            />
          ))
        ) : (
          <Image
            src="/hero-bg.png"
            alt="Vitrofusión Hero"
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        
        {/* Horno Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-tertiary/20 blur-[120px] rounded-full mix-blend-screen z-20 pointer-events-none" />
        {/* Dark radial overlay to ensure text contrast over bright images */}
        <div className="absolute inset-0 bg-radial-[50%_50%] from-surface/90 via-surface/40 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-surface/80 via-transparent to-surface z-20 pointer-events-none" />
      </div>

      {/* Tech Metadata Overlays */}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none p-6 md:p-12 pb-8 md:pb-12 flex justify-between">
        <div className="w-full max-w-7xl mx-auto flex flex-row justify-between items-center text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-on-surface/50" style={{ fontFamily: 'var(--font-label)' }}>
          <div className="flex flex-row items-center gap-2 md:gap-4 drop-shadow-md">
            <span className="text-primary/70 font-bold">PIEZA //</span>
            <span>{metadata?.piezaId || 'NO. 042-BALTIC'}</span>
          </div>
          <div className="hidden md:block flex-1 mx-12 h-px bg-outline-variant/20" />
          <div className="flex flex-row items-center gap-2 md:gap-4 drop-shadow-md">
            <span className="text-primary/70 font-bold">REF //</span>
            <span>{metadata?.referencia || 'VITRO-REFRACT-01'}</span>
          </div>
        </div>
      </div>

      <div className="relative z-30 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        {/* Etiqueta Premium */}
        <div className="mb-8 px-6 py-2 border border-primary/30 bg-surface/20 backdrop-blur-md inline-flex items-center gap-3 relative overflow-hidden">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          <p className="label-text tracking-[0.4em] text-primary mb-0 text-[10px] uppercase drop-shadow-lg">
            VITROFUSIÓN DE AUTOR
          </p>
          <div className="absolute top-0 left-0 w-8 h-px bg-linear-to-r from-transparent via-primary/80 to-transparent" />
        </div>

        {/* Título Principal */}
        <h1 
          className="text-6xl md:text-8xl lg:text-9xl mb-8 leading-[1.05] text-on-surface drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title ? title.split('\n').map((line, i) => (
            <span key={i} className={i === 1 ? 'italic text-on-surface-variant/90 block font-light' : 'block font-medium'}>
              {line}
            </span>
          )) : (
            <>
              <span className="block font-medium">Maestría de la</span>
              <span className="italic text-on-surface-variant/90 block font-light">Luz Molten</span>
            </>
          )}
        </h1>

        {/* Subtítulo */}
        <p className="text-on-surface/80 text-xl md:text-2xl max-w-2xl font-serif mb-14 drop-shadow-lg">
          {subtitle || "Explorando el límite térmico del cristal."}
        </p>

        {/* High-Impact CTA Button */}
        <Link
          href="/colecciones"
          className="group relative inline-flex items-center justify-center border border-primary/60 bg-surface-container/30 backdrop-blur-xl text-on-surface py-5 px-10 uppercase tracking-[0.3em] text-sm transition-all duration-500 overflow-hidden shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.15)] hover:shadow-[0_0_60px_rgba(var(--color-primary-rgb),0.4)] hover:border-primary"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <span className="relative z-10 font-bold group-hover:text-primary transition-colors flex items-center gap-4">
            Explorar Colecciones
            <span className="text-primary text-lg group-hover:translate-x-2 transition-transform duration-300">→</span>
          </span>
        </Link>
      </div>

      {/* Slide Indicators */}
      {images && images.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-px transition-all duration-500 ${i === index ? 'w-12 bg-primary' : 'w-6 bg-outline-variant/30 hover:bg-outline-variant'}`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

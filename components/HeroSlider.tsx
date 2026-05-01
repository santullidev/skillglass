'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { HeroMetadata } from '@/types/producto'

interface SanityMedia {
  _key?: string
  _type?: 'image' | 'file'
  videoUrl?: string
  asset: {
    _ref: string
    _type: 'reference'
  }
}

interface Props {
  images?: SanityMedia[]
  metadata?: HeroMetadata
  title?: string
  subtitle?: string
  ctaTexto?: string
  ctaLink?: string
}

export default function HeroSlider({ images, metadata, title, subtitle, ctaTexto, ctaLink }: Props) {
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
          images.map((media, i) => (
            media._type === 'file' ? (
              <video
                key={media._key || i}
                src={media.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1500 ease-in-out ${
                  i === index ? 'opacity-85 z-10' : 'opacity-0 z-0'
                }`}
              />
            ) : (
              <Image
                key={media._key || i}
                src={urlFor(media).width(1920).url()}
                alt={`Joyería en vidrio Hero ${i + 1}`}
                fill
                className={`object-cover transition-opacity duration-1500 ease-in-out ${
                  i === index ? 'opacity-85 z-10' : 'opacity-0 z-0'
                }`}
                priority={i === 0}
                sizes="100vw"
              />
            )
          ))
        ) : (
          <Image
            src="/hero-bg.png"
            alt="Joyería en vidrio Hero"
            fill
            className="object-cover opacity-100"
            priority
          />
        )}
        
        {/* Horno Glow Effect - Sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/10 blur-[120px] rounded-full z-20 pointer-events-none" />
        
        {/* Soft radial overlay - Protección de legibilidad balanceada */}
        <div className="absolute inset-0 bg-radial-[50%_50%] from-surface/50 via-surface/10 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-surface/60 via-transparent to-surface/60 z-20 pointer-events-none" />
      </div>

      {/* Tech Metadata Overlays */}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none p-6 md:p-12 pb-8 md:pb-12 flex justify-between">
        <div className="w-full max-w-7xl mx-auto flex flex-row justify-between items-center text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-on-surface/50" style={{ fontFamily: 'var(--font-label)' }}>
          <div className="flex flex-row items-center gap-2 md:gap-4 drop-shadow-md">
            <span className="text-gold font-bold">PIEZA //</span>
            <span className="text-on-surface/70">{metadata?.piezaId || 'NO. 042-BALTIC'}</span>
          </div>
          <div className="hidden md:block flex-1 mx-12 h-px bg-outline-variant/20" />
          <div className="flex flex-row items-center gap-2 md:gap-4 drop-shadow-md">
            <span className="text-gold font-bold">REF //</span>
            <span className="text-on-surface/70">{metadata?.referencia || 'VITRO-REFRACT-01'}</span>
          </div>
        </div>
      </div>

      <div className="relative z-30 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        {/* Etiqueta Premium */}
        <div className="mb-10 px-6 py-2 border border-gold/40 bg-surface-deep/40 backdrop-blur-md inline-flex items-center gap-3 relative overflow-hidden">
          <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(201,168,76,0.8)]" />
          <p className="label-text tracking-[0.5em] text-gold mb-0 text-[10px] font-bold uppercase drop-shadow-lg">
            JOYERÍA EN VIDRIO DE AUTOR
          </p>
          <div className="absolute top-0 left-0 w-12 h-px bg-linear-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Título Principal */}
        <h1 
          className="text-5xl md:text-8xl lg:text-9xl mb-4 md:mb-6 leading-tight pb-6 md:pb-12 overflow-visible text-gradient-gold drop-shadow-2xl text-balance"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 10vw, 8rem)' }}
        >
          {title ? title.split('\n').map((line, i, arr) => (
            <span key={i} className={i % 2 === 1 ? 'italic font-light opacity-90' : 'font-medium'}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          )) : (
            <>
              <span className="font-medium">Maestría de la</span>
              <br />
              <span className="italic font-light opacity-90">Vidrio de Autor</span>
            </>
          )}
        </h1>

        {/* Subtítulo */}
        <p className="text-on-surface/80 text-xl md:text-2xl max-w-2xl font-serif mb-14 drop-shadow-lg">
          {subtitle || "Explorando el límite térmico del cristal."}
        </p>

        {/* High-Impact CTA Button */}
        <Link
          href={ctaLink || "/capsulas"}
          className="btn-luxury group"
        >
          <span className="relative z-10 font-bold group-hover:text-surface-deep transition-colors flex items-center gap-6">
            {ctaTexto || "Explorar Cápsulas"}
            <span className="text-gold group-hover:text-surface-deep text-lg group-hover:translate-x-2 transition-all duration-300">→</span>
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
              className={`h-px transition-all duration-700 ${i === index ? 'w-16 bg-gold shadow-[0_0_10px_rgba(201,168,76,0.5)]' : 'w-8 bg-gold/20 hover:bg-gold/40'}`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

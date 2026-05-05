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
      <div className="absolute inset-0 z-0 bg-surface-deep">
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
                  i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              />
            ) : (
              <Image
                key={media._key || i}
                src={urlFor(media).width(1920).url()}
                alt={`Joyería en vidrio Hero ${i + 1}`}
                fill
                className={`object-cover transition-opacity duration-1500 ease-in-out ${
                  i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
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
        
      </div>

      {/* Cinematic Overlay - Refined for depth */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-surface to-transparent" />
      </div>

      {/* Tech Metadata Overlays */}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none p-6 md:p-12 pb-8 md:pb-12 flex justify-between">
        <div className="w-full max-w-7xl mx-auto flex flex-row justify-between items-center text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-white/40" style={{ fontFamily: 'var(--font-label)' }}>
          <div className="flex flex-row items-center gap-2 md:gap-4 drop-shadow-lg">
            <span className="text-gold/80 font-bold">PIEZA //</span>
            <span className="text-white/50">{metadata?.piezaId || 'NO. 042-BALTIC'}</span>
          </div>
          <div className="hidden md:block flex-1 mx-12 h-px bg-white/10" />
          <div className="flex flex-row items-center gap-2 md:gap-4 drop-shadow-lg">
            <span className="text-gold/80 font-bold">REF //</span>
            <span className="text-white/50">{metadata?.referencia || 'VITRO-REFRACT-01'}</span>
          </div>
        </div>
      </div>

      <div className="relative z-30 text-center px-4 md:px-6 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Floating Editorial Header */}
        <div className="mb-10 flex items-center justify-center gap-6 opacity-90">
          <div className="w-12 h-px bg-gold/40" />
          <p className="text-[10px] md:text-xs tracking-[0.6em] text-white font-bold uppercase drop-shadow-lg" style={{ fontFamily: 'var(--font-label)' }}>
            JOYERÍA EN VIDRIO DE AUTOR
          </p>
          <div className="w-12 h-px bg-gold/40" />
        </div>

        {/* Main Title - Floating & High Contrast */}
        <h1 
          className="text-white mb-8 leading-[0.85] tracking-tighter drop-shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 12vw, 10rem)' }}
        >
          {title ? title.split('\n').map((line, i, arr) => (
            <span key={i} className={i % 2 === 1 ? 'italic font-light text-gold/90' : 'font-medium'}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          )) : (
            <>
              <span className="font-medium">Joyas de</span>
              <br />
              <span className="italic font-light text-gold/90">Alquimia</span>
            </>
          )}
        </h1>

        {/* Subtitle - Elegant & Floating */}
        <p className="text-white/80 text-xl md:text-2xl lg:text-3xl max-w-2xl font-serif italic mb-14 text-balance leading-relaxed drop-shadow-lg">
          {subtitle || "Explorando el límite térmico del cristal."}
        </p>

        {/* Elegant CTA */}
        <Link
          href={ctaLink || "/capsulas"}
          className="group relative inline-flex items-center gap-8 px-12 py-6 text-[10px] tracking-[0.5em] text-white uppercase border border-white/20 bg-white/5 backdrop-blur-md hover:bg-gold hover:text-black hover:border-gold transition-all duration-700 overflow-hidden"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <span className="relative z-10 font-bold">{ctaTexto || "Explorar Cápsulas"}</span>
          <span className="relative z-10 text-lg group-hover:translate-x-2 transition-transform duration-500">→</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gold transition-transform duration-700 ease-in-out" />
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

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

export default function HeroImpact({ images, metadata, title, subtitle, ctaTexto, ctaLink }: Props) {
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
      
      {/* 1. Immersive Background Layer */}
      <div className="absolute inset-0 z-0">
        {images && images.length > 0 ? (
          images.map((media, i) => (
            <div 
              key={media._key || i}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {media._type === 'file' ? (
                <video
                  src={media.videoUrl}
                  autoPlay muted loop playsInline
                  className="w-full h-full object-cover scale-110 animate-slow-zoom"
                />
              ) : (
                <Image
                  src={urlFor(media).width(1920).url()}
                  alt="Joyería de autor"
                  fill
                  className="object-cover scale-110 animate-slow-zoom"
                  priority={i === 0}
                />
              )}
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-surface-deep" />
        )}
        
        {/* Cinematic Overlays: Heavy Vignette for perfect focus & Navbar readability */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-black/60 to-transparent" />
        </div>
      </div>

      {/* 2. The Museum Frame (Gold Border) */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 z-30 border border-gold/30 pointer-events-none flex flex-col justify-between p-6 md:p-10">
        {/* Top Frame Corner Info */}
        <div className="flex justify-between items-start opacity-60">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] md:text-[10px] tracking-[0.5em] text-white font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
              SKIL GLASS // STUDIO
            </span>
            <div className="w-12 h-px bg-gold/50" />
          </div>
          <span className="text-[8px] md:text-[10px] tracking-[0.5em] text-white font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
            BUENOS AIRES
          </span>
        </div>

        {/* Bottom Frame Corner Info */}
        <div className="flex justify-between items-end opacity-60">
          <div className="flex items-center gap-4">
            <span className="text-[8px] md:text-[10px] tracking-[0.5em] text-white font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
              REF. {metadata?.referencia || '2026-X'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-12 h-px bg-gold/50" />
            <span className="text-[8px] md:text-[10px] tracking-[0.5em] text-white font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
              EDICIÓN LIMITADA
            </span>
          </div>
        </div>
      </div>

      {/* 3. Central Gallery Content */}
      <div className="relative z-40 text-center px-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
          
          {/* Subtle Label */}
          <p className="text-gold text-[10px] md:text-xs tracking-[0.8em] font-bold uppercase mb-8 drop-shadow-md" style={{ fontFamily: 'var(--font-label)' }}>
            JOYERÍA EN VIDRIO
          </p>

          {/* Elegant Gallery Title */}
          <h1 
            className="text-white mb-10 leading-[0.9] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
          >
            {title ? title.split('\n').map((line, i) => (
              <span key={i} className={i % 2 === 1 ? 'italic font-light text-gold/90' : 'font-medium'}>
                {line}
                {i < title.split('\n').length - 1 && <br />}
              </span>
            )) : (
              <>
                Skil<br />
                <span className="italic font-light text-gold/90">Glass</span>
              </>
            )}
          </h1>

          {/* Subtitle with better contrast */}
          <p className="text-white/80 text-lg md:text-2xl max-w-2xl font-serif italic mb-14 drop-shadow-lg leading-relaxed">
            {subtitle || "Capturando la esencia del fuego en formas orgánicas de cristal."}
          </p>

          {/* Minimalist Gallery CTA */}
          <Link
            href={ctaLink || "/capsulas"}
            className="group relative px-16 py-6 border border-white/20 hover:border-gold transition-all duration-700 overflow-hidden"
          >
            <span className="relative z-10 text-white font-bold tracking-[0.4em] text-[10px] group-hover:text-black transition-colors duration-500">
              {ctaTexto || "INGRESAR AL ESTUDIO"}
            </span>
            <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slow-zoom {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 15s ease-out infinite alternate;
        }
      `}</style>
    </section>
  )
}

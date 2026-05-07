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

export default function HeroStudio({ images, metadata, title, subtitle, ctaTexto, ctaLink }: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [images])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#FFF5F5]">
      
      {/* 1. Immersive Background - Much Brighter & Warm */}
      <div className="absolute inset-0 z-0">
        {images && images.length > 0 ? (
          images.map((media, i) => (
            <div 
              key={media._key || i}
              className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
                i === index ? 'opacity-40 z-10 scale-100' : 'opacity-0 z-0 scale-110'
              }`}
            >
              {media._type === 'file' ? (
                <video
                  src={media.videoUrl}
                  autoPlay muted loop playsInline
                  className="w-full h-full object-cover grayscale opacity-50"
                />
              ) : (
                <Image
                  src={urlFor(media).width(1920).url()}
                  alt="Luz del Estudio"
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              )}
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-[#FFF5F5]" />
        )}
        
        {/* Luminous Overlays: Warm Rose Gold & Transitions */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Top Protection (Stronger for Navbar visibility) */}
          <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/60 via-black/20 to-transparent" />
          
          {/* Luminous Core (Warm light from center) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,245,245,0.2)_0%,rgba(255,245,245,1)_100%)]" />
          
          {/* Bottom Transition (Fades perfectly to the white section below) */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-white to-transparent" />
          
          {/* Warm Artistic Accents */}
          <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-[#FFD1D1]/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-[#FFE5B4]/20 blur-[120px] rounded-full" />
        </div>
      </div>

      {/* 2. Floating Technical Details (Light Theme) */}
      <div className="absolute inset-0 z-30 pointer-events-none p-12 hidden md:flex flex-col justify-between">
        <div className="flex justify-between items-start opacity-40">
          <div className="flex flex-col gap-1 border-l border-[#6B1A2A] pl-4 py-2">
             <span className="text-[10px] tracking-[0.5em] text-[#6B1A2A] font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
               SKIL GLASS // STUDIO
             </span>
          </div>
          <span className="text-[10px] tracking-[0.5em] text-[#6B1A2A] font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
            BUENOS AIRES
          </span>
        </div>

        <div className="flex justify-between items-end opacity-40">
           <div className="flex flex-col gap-1 border-l border-[#6B1A2A] pl-4 py-2">
             <span className="text-[10px] tracking-[0.5em] text-[#6B1A2A] font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
               REF. {metadata?.referencia || 'STUDIO-2026'}
             </span>
           </div>
           <div className="text-[10px] tracking-[0.6em] text-[#6B1A2A] font-bold uppercase rotate-90 origin-right translate-y-[-100%] translate-x-[200%]">
             ALQUIMIA
           </div>
        </div>
      </div>

      {/* 3. Luminous Central Content */}
      <div className="relative z-40 text-center px-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          
          {/* Editorial Label */}
          <p className="text-[#6B1A2A]/60 text-[10px] md:text-xs tracking-[0.6em] font-bold uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>
            Materia y Luz
          </p>

          {/* High-Impact Title: Deep Bordó on Luminous Background */}
          <h1 
            className="text-[#6B1A2A] mb-8 leading-[0.9] tracking-tighter"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
          >
            {title ? title.split('\n').map((line, i) => (
              <span key={i} className={i % 2 === 1 ? 'italic font-light opacity-90 block mt-2' : 'font-medium block'}>
                {line}
              </span>
            )) : (
              <>
                Skil<br />
                <span className="italic font-light opacity-90 mt-2 block">Glass</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-on-surface-variant text-lg md:text-2xl max-w-xl font-serif italic mb-14 leading-relaxed tracking-wide">
            {subtitle || "Una danza entre la temperatura extrema y la transparencia absoluta."}
          </p>

          {/* Luxury CTA Button */}
          <Link
            href={ctaLink || "/capsulas"}
            className="group relative px-16 py-6 border-2 border-[#6B1A2A]/20 hover:border-[#6B1A2A] transition-all duration-700 overflow-hidden"
          >
            <span className="relative z-10 text-[#6B1A2A] font-bold tracking-[0.5em] text-[11px] group-hover:text-white transition-colors duration-500">
              {ctaTexto || "VER CÁPSULAS"}
            </span>
            <div className="absolute inset-0 bg-[#6B1A2A] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />
          </Link>
        </div>
      </div>

      {/* Visual Texture */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.06] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

    </section>
  )
}

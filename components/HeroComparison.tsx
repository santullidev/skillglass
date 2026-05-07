'use client'

import { useState } from 'react'
import HeroSlider from './HeroSlider'
import HeroMinimal from './HeroMinimal'
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

export default function HeroComparison(props: Props) {
  const [variant, setVariant] = useState(0) // 0: Actual, 1: Anterior

  const nextVariant = () => setVariant((prev) => (prev === 0 ? 1 : 0))
  const prevVariant = () => setVariant((prev) => (prev === 0 ? 1 : 0))

  return (
    <div className="relative group/comparison">
      {/* Active Hero Variant */}
      <div className="transition-all duration-700 ease-in-out">
        {variant === 0 ? (
          <HeroSlider {...props} />
        ) : (
          <HeroMinimal {...props} />
        )}
      </div>

      {/* Manual Controls */}
      <div className="absolute inset-y-0 left-0 z-50 flex items-center p-4">
        <button 
          onClick={prevVariant}
          className="bg-black/10 hover:bg-black/30 backdrop-blur-md p-4 transition-all duration-300 group/btn"
          aria-label="Modelo anterior"
        >
          <span className="text-white group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 z-50 flex items-center p-4">
        <button 
          onClick={nextVariant}
          className="bg-black/10 hover:bg-black/30 backdrop-blur-md p-4 transition-all duration-300 group/btn"
          aria-label="Siguiente modelo"
        >
          <span className="text-white group-hover:translate-x-1 transition-transform inline-block">→</span>
        </button>
      </div>

      {/* Floating Info Badge */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-primary px-4 py-2 text-[10px] tracking-[0.3em] font-bold text-white uppercase shadow-2xl animate-pulse">
          PRUEBA DE DISEÑO: {variant === 0 ? 'MODELO ACTUAL' : 'MODELO ANTERIOR'}
        </div>
      </div>

      {/* Variant Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        <button 
          onClick={() => setVariant(0)}
          className={`h-2 transition-all duration-500 ${variant === 0 ? 'w-12 bg-primary' : 'w-4 bg-primary/30'}`}
        />
        <button 
          onClick={() => setVariant(1)}
          className={`h-2 transition-all duration-500 ${variant === 1 ? 'w-12 bg-primary' : 'w-4 bg-primary/30'}`}
        />
      </div>
    </div>
  )
}

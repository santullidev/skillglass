'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

interface SanityImage {
  _key?: string
  _type?: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

interface Props {
  images: SanityImage[]
  alt: string
}

export default function ImageCarousel({ images, alt }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-surface-container-low iridescent-edge flex items-center justify-center">
        <span className="text-on-surface-variant font-serif">Sin imagen</span>
      </div>
    )
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative aspect-square w-full bg-surface-container-low iridescent-edge group overflow-hidden">
      <Image
        src={urlFor(images[currentIndex]).width(800).height(800).fit('crop').url()}
        alt={`${alt} - Imagen ${currentIndex + 1}`}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        priority={currentIndex === 0}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />

      {images.length > 1 && (
        <>
          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-surface/50 hover:bg-surface text-on-surface opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md"
            aria-label="Anterior imagen"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-surface/50 hover:bg-surface text-on-surface opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md"
            aria-label="Siguiente imagen"
          >
            →
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentIndex(idx)
                }}
                className={`w-2 h-2 transition-all duration-300 ${
                  idx === currentIndex ? 'bg-primary scale-125' : 'bg-outline-variant/50 hover:bg-outline-variant'
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

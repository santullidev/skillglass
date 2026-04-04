'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

interface Props {
  id: string
  nombre: string
  slug: string
  precio: number
  imagenUrl: string
}

export default function AddToCartButton({ id, nombre, slug, precio, imagenUrl }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id,
      nombre,
      slug,
      precio,
      imagenUrl,
      referencia: `Ref: SKG-${id.substring(0, 4).toUpperCase()} // Serie Limitada` // Simulated reference
    })
    
    setAdded(true)
    setTimeout(() => setAdded(false), 2000) // Reset after 2 seconds
  }

  return (
    <button
      onClick={handleAdd}
      className={`group relative w-full border border-outline-variant/30 text-on-surface py-4 px-6 transition-all duration-300 overflow-hidden ${
        added ? 'bg-primary-container text-primary border-primary/50' : 'hover:border-primary/50 hover:text-primary'
      }`}
      style={{ fontFamily: 'var(--font-label)' }}
    >
      <span className="relative z-10 tracking-wide text-sm uppercase flex items-center justify-center gap-2">
        {added ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Agregado al carrito
          </>
        ) : (
          'Agregar al carrito'
        )}
      </span>
      {/* Caustic glow on hover */}
      {!added && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-primary/5 to-transparent" />
      )}
    </button>
  )
}

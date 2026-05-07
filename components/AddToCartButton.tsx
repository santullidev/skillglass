'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import type { Producto } from '@/types/producto'
import { urlFor } from '@/lib/sanity'

interface Props {
  producto: Producto
  imagen?: string
}

export default function AddToCartButton({ producto, imagen }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    const imagenUrl = imagen || (producto.imagenes?.[0] ? urlFor(producto.imagenes[0]).width(400).url() : '')

    addItem({
      id: producto._id,           // ← siempre el _id de Sanity (UUID)
      nombre: producto.nombre,
      slug: producto.slug,
      precio: producto.precio,
      imagenUrl,
      referencia: `Ref: SKG-${producto._id.substring(0, 4).toUpperCase()} // Pieza Única`,
      numeroCertificado: producto.numeroCertificado,
      peso: producto.peso,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
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
      {!added && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-primary/5 to-transparent" />
      )}
    </button>
  )
}

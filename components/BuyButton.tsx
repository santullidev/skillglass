'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import type { Producto } from '@/types/producto'
import { urlFor } from '@/lib/sanity'

interface Props {
  producto: Producto
  imagen?: string
}

export default function BuyButton({ producto, imagen }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addItem } = useCart()

  const handleComprar = async () => {
    setLoading(true)
    try {
      const imagenUrl = imagen || (producto.imagenes?.[0] ? urlFor(producto.imagenes[0]).width(400).url() : '')

      addItem({
        id: producto._id,         // ← siempre el _id de Sanity (UUID)
        nombre: producto.nombre,
        slug: producto.slug,
        precio: producto.precio,
        imagenUrl,
        referencia: `Ref: SKG-${producto._id.substring(0, 4).toUpperCase()} // Pieza Única de Autor`,
        numeroCertificado: producto.numeroCertificado,
        peso: producto.peso,
      })

      router.push('/envio')
    } catch (error) {
      console.error('Error al iniciar compra directa:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleComprar}
      disabled={loading}
      className="group relative w-full bg-primary-container text-primary font-semibold py-4 px-6 transition-all duration-300 hover:shadow-[inset_0_0_30px_rgba(169,199,255,0.15)] disabled:opacity-40"
      style={{ fontFamily: 'var(--font-label)' }}
    >
      <span className="relative z-10 tracking-wide text-sm uppercase">
        {loading ? 'Preparando...' : 'Comprar ahora'}
      </span>
      {/* Caustic glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-primary/5 to-primary/5 to-transparent" />
    </button>
  )
}
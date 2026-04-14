'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

interface Props {
  id: string
  nombre: string
  precio: number
  slug: string
  imagenUrl: string
  numeroCertificado?: string
  peso?: number
}

export default function BuyButton({ id, nombre, precio, slug, imagenUrl, numeroCertificado, peso }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addItem } = useCart()

  const handleComprar = async () => {
    setLoading(true)
    try {
      // 1. Agregar al carrito (si no está ya)
      addItem({
        id,
        nombre,
        slug,
        precio,
        imagenUrl,
        referencia: `Ref: SKG-${id.substring(0, 4).toUpperCase()} // Pieza Única de Autor`,
        numeroCertificado,
        peso
      })

      // 2. Redirigir al flujo de envío
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
        {loading ? 'Preparando envío...' : 'Comprar ahora'}
      </span>
      {/* Caustic glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-primary-container via-primary/5 to-primary-container" />
    </button>
  )
}
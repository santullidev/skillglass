'use client'

import { useState } from 'react'

interface Props {
  nombre: string
  precio: number
  slug: string
}

export default function BuyButton({ nombre, precio, slug }: Props) {
  const [loading, setLoading] = useState(false)

  const handleComprar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, slug }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
    } finally {
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
        {loading ? 'Redirigiendo a pago...' : 'Comprar ahora'}
      </span>
      {/* Caustic glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary-container via-primary/5 to-primary-container" />
    </button>
  )
}
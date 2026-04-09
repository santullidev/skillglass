'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import Link from 'next/link'

export default function DatosEnvioPage() {
  const { items, totalPrice } = useCart()
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    provincia: '',
    ciudad: '',
    direccion: '',
    codigoPostal: '',
    notas: '',
  })

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (key) {
      initMercadoPago(key, { locale: 'es-AR' })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items,
          shippingData: formData 
        }),
      })

      const data = await response.json()
      if (data.id) {
        setPreferenceId(data.id)
        setFormSubmitted(true)
      }
    } catch (error) {
      console.error('Error al crear preferencia:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0 && !formSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl mb-4 font-serif">Tu carrito está vacío</h1>
        <Link href="/productos" className="text-gold underline">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl text-on-surface mb-8 border-b border-outline-variant/20 pb-6" style={{ fontFamily: 'var(--font-display)' }}>
        Datos de Envío
      </h1>

      {!formSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Nombre Completo</label>
              <input required name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Email de contacto</label>
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Teléfono</label>
              <input required name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Provincia</label>
              <input required name="provincia" value={formData.provincia} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Ciudad</label>
              <input required name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Código Postal</label>
              <input required name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase opacity-70">Dirección (Calle y Número)</label>
            <input required name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase opacity-70">Notas / Instrucciones (Opcional)</label>
            <textarea name="notas" value={formData.notas} onChange={handleInputChange} rows={3} className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-on-surface text-surface py-5 px-6 font-bold tracking-[0.3em] uppercase text-xs transition-all hover:bg-on-surface/90 disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Confirmar Datos y Pagar'}
          </button>
        </form>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-surface-container/30 border border-outline-variant/20 p-8">
            <h2 className="text-xl mb-6 font-serif border-b border-outline-variant/10 pb-4">Confirmación de Envío</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm opacity-80">
              <span className="text-[10px] uppercase tracking-widest">Destinatario</span>
              <span className="text-right">{formData.nombre}</span>
              <span className="text-[10px] uppercase tracking-widest">Email</span>
              <span className="text-right">{formData.email}</span>
              <span className="text-[10px] uppercase tracking-widest">Dirección</span>
              <span className="text-right">{formData.direccion}, {formData.ciudad}</span>
              <span className="text-[10px] uppercase tracking-widest">Total Compra</span>
              <span className="text-right font-bold">$ {totalPrice.toLocaleString('es-AR')} ARS</span>
            </div>
          </div>

          <div className="wallet-container">
            {preferenceId && (
              <Wallet 
                initialization={{ preferenceId }} 
                customization={{
                  valueProp: 'practicality',
                  customStyle: {
                    buttonBackground: 'default',
                    borderRadius: '6px',
                  }
                }}
              />
            )}
          </div>
          
          <button 
            onClick={() => setFormSubmitted(false)}
            className="w-full text-[10px] tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity"
          >
            Editar datos de envío
          </button>
        </div>
      )}
    </div>
  )
}

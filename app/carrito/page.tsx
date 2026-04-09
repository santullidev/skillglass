'use client'

import { useCart } from '@/lib/cart-context'
import CartItemLine from '@/components/CartItem'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mpReady, setMpReady] = useState(false)

  // Inicializar MP dentro de useEffect
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (key) {
      initMercadoPago(key, { locale: 'es-AR' })
      setMpReady(true)
    }
  }, [])

  // Sincronizar preferencia con el carrito
  useEffect(() => {
    if (!mpReady || items.length === 0) {
      if (items.length === 0) setPreferenceId(null)
      return
    }

    const crearPreferencia = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/crear-preferencia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items }),
        })

        const data = await response.json()
        if (data.id) {
          setPreferenceId(data.id)
        }
      } catch (error) {
        console.error('Error al crear preferencia:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Pequeño timeout para evitar múltiples llamadas rápidas si el usuario cambia cantidades seguido
    const timeout = setTimeout(crearPreferencia, 500)
    return () => clearTimeout(timeout)
  }, [items, mpReady])

  // FIX: Resetear estado si el usuario vuelve desde MP con "atrás"
  // (Aunque con Wallet esto es menos crítico, es bueno mantenerlo)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      // persisted = true significa que viene del bfcache
      if (e.persisted) {
        setIsLoading(false)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsLoading(false)
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl lg:text-5xl text-on-surface mb-6 relative z-10" style={{ fontFamily: 'var(--font-display)' }}>
          Tu carrito está vacío
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto mb-10 relative z-10">
          Explora la colección &ldquo;Luz Fundida&rdquo; y encuentra piezas únicas moldeadas en el calor de nuestro estudio.
        </p>
        <Link href="/" className="relative group inline-block z-10">
          <span className="block border border-outline-variant/30 text-on-surface py-4 px-8 tracking-wide uppercase hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm" style={{ fontFamily: 'var(--font-label)' }}>
            Explorar Colecciones
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
        </Link>
      </div>
    )
  }

  const shipping = 0
  const taxes = totalPrice * 0.21
  const finalTotal = totalPrice

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7">
          <h1 className="text-4xl text-on-surface mb-12 border-b border-outline-variant/20 pb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Tu Carrito
          </h1>
          
          <div className="flex flex-col">
            {items.map((item) => (
              <CartItemLine
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Checkout Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-surface-container/50 border border-outline-variant/20 p-8">
            <h2 className="text-xl text-on-surface mb-8 pb-4 border-b border-outline-variant/20" style={{ fontFamily: 'var(--font-label)' }}>
              Resumen
            </h2>

            <div className="space-y-6 text-sm" style={{ fontFamily: 'var(--font-label)' }}>
              <div className="flex justify-between text-on-surface-variant text-xs tracking-wider">
                <span>SUBTOTAL</span>
                <span>$ {totalPrice.toLocaleString('es-AR')} ARS</span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-xs tracking-wider">
                <span>ENVÍO (EXPRESS)</span>
                <span>$ {shipping} ARS</span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-xs tracking-wider">
                <span>IMPUESTOS</span>
                <span>$ {taxes.toLocaleString('es-AR')} ARS</span>
              </div>
              
              <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="text-on-surface font-bold tracking-widest text-xs">TOTAL</span>
                <span className="text-on-surface text-2xl font-bold tracking-wider">
                  $ {finalTotal.toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>

            {/* Mercado Pago Official Wallet Component */}
            <div className="mt-10 min-h-[48px]">
              {isLoading ? (
                <div className="w-full bg-[#FFE600] flex items-center justify-center py-3.5 px-6 rounded-[6px] shadow-sm animate-pulse">
                  <div className="w-5 h-5 border-2 border-[#001D47]/20 border-t-[#001D47] rounded-full animate-spin" />
                </div>
              ) : preferenceId ? (
                <div className="wallet-container transition-all duration-300">
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
                </div>
              ) : (
                <div className="w-full bg-[#FFE600]/20 flex items-center justify-center py-3.5 px-6 rounded-[6px] border border-dashed border-[#FFE600]/50">
                   <span className="text-[10px] tracking-[0.2em] uppercase text-[#001D47]/50">Iniciando Pago...</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-outline-variant text-[10px] tracking-widest uppercase">
              <span className="flex items-center gap-1.5 opacity-60">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Transacción Segura SSL 256 BITS
              </span>
            </div>
            
            <div className="mt-10 pt-10 border-t border-outline-variant/10">
              <label className="block text-[10px] text-on-surface-variant mb-3 uppercase tracking-[0.2em] opacity-80" style={{ fontFamily: 'var(--font-label)' }}>
                Código Promocional
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="INGRESAR CÓDIGO" 
                  className="bg-transparent border border-outline-variant/20 px-4 py-3.5 text-xs text-on-surface w-full focus:outline-none focus:border-primary/40 transition-all placeholder:text-on-surface-variant/30"
                />
                <button className="border border-outline-variant/20 px-5 py-3.5 text-[10px] uppercase tracking-widest text-on-surface hover:bg-on-surface hover:text-surface transition-all duration-300" style={{ fontFamily: 'var(--font-label)' }}>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

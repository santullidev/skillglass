'use client'

import { useCart } from '@/lib/cart-context'
import CartItemLine from '@/components/CartItem'
import Link from 'next/link'
import { useState } from 'react'

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }), // We will update the API to handle the array of CartItems
      })

      const data = await response.json()
      
      if (data.id) {
        // Redirect to MercadoPago checkout
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`
      } else {
        throw new Error('No se pudo crear la preferencia')
      }
    } catch (error) {
      console.error('Error al procesar pago:', error)
      setIsProcessing(false)
      alert("Hubo un error al procesar el pago. Por favor intenta de nuevo.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl lg:text-5xl text-on-surface mb-6 relative z-10" style={{ fontFamily: 'var(--font-display)' }}>
          Tu carrito está vacío
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto mb-10 relative z-10">
          Explora la colección &ldquo;Luz Fundida&rdquo; y encuentra piezas únicas moldeadas en el calor de nuestro estudio.
        </p>
        <Link
          href="/"
          className="relative group inline-block z-10"
        >
          <span className="block border border-outline-variant/30 text-on-surface py-4 px-8 tracking-wide uppercase hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm" style={{ fontFamily: 'var(--font-label)' }}>
            Explorar Colecciones
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
        </Link>
      </div>
    )
  }

  const shipping = 0 // Express shipping is 0 ARS in Stitch design
  // Simplified taxes for visual purposes (MercadoPago handles final total)
  const taxes = totalPrice * 0.21
  const finalTotal = totalPrice // In Argentina, prices usually include IVA, depending on business logic. Sticking to Stitch display logic.

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

          {/* Eco-Global Shipping Section */}
          <div className="mt-12 flex items-start gap-4 p-6 bg-surface-container/30 border border-outline-variant/10">
            <svg className="w-6 h-6 text-primary shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <div>
              <h4 className="text-on-surface font-semibold mb-2" style={{ fontFamily: 'var(--font-label)' }}>
                ECO-GLOBAL SHIPPING
              </h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Tu pedido será embalado en materiales 100% reciclables y neutros en carbono. Cada pieza se protege con fibra de maíz biodegradable.
              </p>
            </div>
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

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full mt-10 bg-primary-container text-primary border border-primary/20 py-4 uppercase tracking-widest text-sm hover:bg-primary/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              <span className="relative z-10">{isProcessing ? 'PROCESANDO...' : 'PROCEDER AL PAGO'}</span>
              {!isProcessing && (
                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-primary/5 to-transparent shadow-[inset_0_0_15px_rgba(207,184,179,0.2)]" />
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-outline-variant text-xs">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Transacción Segura SSL 256 BITS
              </span>
            </div>
            
            <div className="mt-8 pt-8 border-t border-outline-variant/20">
              <label className="block text-xs text-on-surface-variant mb-2 uppercase tracking-wide" style={{ fontFamily: 'var(--font-label)' }}>
                Código Promocional
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="INGRESAR CÓDIGO" 
                  className="bg-transparent border border-outline-variant/20 px-4 py-3 text-sm text-on-surface w-full focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button className="border border-outline-variant/20 px-4 py-3 text-xs uppercase tracking-wider text-on-surface hover:bg-surface-container transition-colors" style={{ fontFamily: 'var(--font-label)' }}>
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

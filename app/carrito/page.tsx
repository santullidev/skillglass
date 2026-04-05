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
        body: JSON.stringify({ items }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.id) {
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

            {/* Mercado Pago Official Button - Pixel Perfect Reconstruction */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full mt-10 relative overflow-hidden group active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 bg-[#FFE600] flex items-center justify-center py-3.5 px-6 rounded-[6px] shadow-sm group-hover:bg-[#F5DD00] transition-colors border-none min-h-[48px]">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#001D47]/20 border-t-[#001D47] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {/* Official High-Fidelity Mercado Pago Horizontal Logo SVG */}
                    <svg viewBox="0 0 1048.82 250" className="h-[22px] w-auto" xmlns="http://www.w3.org/2000/svg">
                      {/* Icon Section (Ellipse + Handshake) */}
                      <g fill="#001D47">
                        <path d="M125.1,0C56,0,0,32.3,0,72.1s56,75.3,125.1,75.3s125.1-35.4,125.1-75.3S194.2,0,125.1,0z M235.1,66.8 c-27.4,6.1-47.9,14.9-53,17.2c-12-10.4-39.6-34.5-47.1-40.1c-4.3-3.2-7.2-4.9-9.8-5.7c-1.1-0.4-2.7-0.7-4.8-0.7c-1.9,0-4,0.3-6.1,1 c-4.8,1.5-9.7,5.4-14.3,9.1l-0.2,0.2c-4.3,3.5-8.8,7-12.2,7.8c-1.5,0.3-3,0.5-4.5,0.5c-3.8,0-7.2-1.1-8.5-2.7 c-0.2-0.3-0.1-0.7,0.4-1.3l0.1-0.1l10.5-11.3c8.2-8.2,16-16,33.9-16.4c0.3,0,0.6,0,0.9,0c11.1,0,22.3,5,23.5,5.6 c10.5,5.1,21.2,7.7,32.1,7.7c11.3,0,22.9-2.8,35.1-8.4c12.8,10.7,21.2,23.7,23.8,37.8C239.5,67.8,237.4,67.3,235.1,66.8z"/>
                        <path d="M472.1,51.8c-3.7-4.6-9.4-6.9-17-6.9s-13.3,2.3-17,6.9c-3.7,4.6-5.6,10.1-5.6,16.4s1.9,11.9,5.6,16.5 c3.7,4.6,9.4,6.8,17,6.8s13.3-2.3,17-6.8c3.7-4.6,5.6-10.1,5.6-16.5S475.8,56.4,472.1,51.8z M462.9,78.3 c-1.8,2.4-4.4,3.6-7.8,3.6s-6-1.2-7.8-3.6c-1.8-2.4-2.7-5.8-2.7-10.1s0.9-7.7,2.7-10.1c1.8-2.4,4.4-3.6,7.8-3.6s6,1.2,7.8,3.6 c1.8,2.4,2.7,5.7,2.7,10.1S464.7,75.9,462.9,78.3z"/>
                        <path d="M376.9,47.9c-3.8-1.9-8.1-2.9-13-2.9c-7.5,0-12.8,2-15.8,5.9c-1.9,2.5-3,5.7-3.3,9.6h11.2 c0.3-1.7,0.8-3.1,1.6-4.1c1.2-1.4,3.1-2,5.9-2c2.5,0,4.4,0.3,5.6,1c1.3,0.7,1.9,2,1.9,3.8c0,1.5-0.8,2.6-2.5,3.3 c-0.9,0.4-2.5,0.7-4.6,1l-4,0.5c-4.5,0.6-7.9,1.5-10.2,2.9c-4.2,2.4-6.3,6.4-6.3,11.8c0,4.2,1.3,7.4,3.9,9.7 c2.6,2.3,6,3.3,10,3.4c25.3,1.1,25-13.3,25.2-16.3v-16.6C382.5,53.3,380.7,49.7,376.9,47.9z M371,73.2c-0.1,3.9-1.2,6.5-3.3,7.4 c-2.1,1.5-4.5,2.2-7,2.2c-1.6,0-3-0.5-4.1-1.3c-1.1-0.9-1.7-2.3-1.7-4.3c0-2.2,0.9-3.9,2.7-4.9c1.1-0.6,2.9-1.2,5.3-1.6l2.6-0.5 c1.3-0.2,2.4-0.5,3.1-0.8c0.8-0.3,1.5-0.7,2.2-1.1V73.2z"/>
                        <path d="M319.3,55c2.9,0,5,0.9,6.4,2.7c0.9,1.3,1.5,2.8,1.7,4.5H340c-0.7-6.3-2.9-10.7-6.6-13.2s-8.5-3.7-14.3-3.7 c-6.9,0-12.2,2.1-16.2,6.3c-3.9,4.2-5.9,10.1-5.9,17.7c0,6.7,1.8,12.2,5.3,16.4s9,6.3,16.5,6.3s13.2-2.5,17-7.6 c2.4-3.1,3.7-6.5,4-9.9h-12.4c-0.3,2.3-1,4.2-2.2,5.7c-1.2,1.5-3.2,2.2-6.1,2.2c-4,0-6.8-1.8-8.2-5.5c-0.8-2-1.2-4.6-1.2-7.8 s0.4-6.1,1.2-8.2C307.3,58.8,310.2,55,31.3,55L319.3,55z"/>
                        <path d="M293.6,45.2c-25.6,0-24.1,22.7-24.1,22.7v23h11.6V69.3c0-3.5,0.5-6.2,1.3-7.9c1.6-3,4.7-4.5,9.4-4.5 c0.4,0,0.8,0,1.4,0.1c0.6,0,1.2,0.1,2,0.2v-11.8c-0.5,0-0.9-0.1-1-0.1C294,45.2,293.8,45.2,293.6,45.2z"/>
                        <path d="M260.2,53.8c-2-3-4.6-5.1-7.6-6.5c-3.1-1.4-6.5-2.1-10.4-2.1c-6.5,0-11.7,2-15.8,6.1c-4.1,4.1-6.1,9.9-6.1,17.6 c0,8.2,2.3,14,6.7,18.1c4.5,4.1,9.7,6.1,15.5,6.1c7.1,0,12.7-2.1,16.6-6.4c2.1-2.3,3.5-4.5,4-6.7h-12.3c-0.5,0.7-1,1.3-1.6,1.8 c-1.6,1.4-3.9,2.1-6.5,2.1c-2.5,0-4.4-0.4-6.2-1.5c-2.9-1.8-4.5-4.8-4.7-9.2H263c0-3.8-0.1-6.7-0.4-8.8 C261.9,59.3,261.3,56.3,260.2,53.8z M232.2,64.1c0.4-2.9,1.5-5.1,3.1-6.8c1.6-1.7,3.9-2.5,6.9-2.5c2.7,0,5,0.8,6.9,2.4 c1.8,1.6,2.9,3.9,3.1,7H232.2z"/>
                        <path d="M197.8,45c-5.4,0-10.1,2.4-13.2,6.2c-3-3.8-7.6-6.2-13.2-6.2c-11.3,0-18.7,8.3-18.7,19.4v26.5h10.6V64.4 c0-4.9,3.3-8.2,8.1-8.2c7,0,7.7,5.8,7.7,8.2v26.5h10.6V64.4c0-4.9,3.4-8.2,8.1-8.2c7,0,7.8,5.8,7.8,8.2v26.5h10.6V64.4 c0-11.4-6.8-19.4-18.4-19.4z"/>
                        <path d="M417.9,39.4l0,12.4c-1.3-2.1-3-3.7-5.1-4.9c-2.1-1.2-4.5-1.8-7.1-1.8c-5.8,0-10.4,2.2-13.9,6.5 c-3.5,4.3-5.2,10.6-5.2,18.1c0,6.5,1.8,11.9,5.3,16.1c3.5,4.2,10.4,6,16.6,6c21.4,0,21.1-18.3,21.1-18.3v-42.2 C429.7,33.1,417.9,31.9,417.9,41.2z M415.7,78.7c-1.7,2.4-4.2,3.6-7.5,3.6s-5.7-1.2-7.3-3.7c-1.6-2.5-2.4-6-2.4-10.1 c0-3.8,0.8-6.9,2.4-9.5s4.1-3.8,7.4-3.8c2.2,0,4.2,0.7,5.8,2.1c2.7,2.3,4.1,6.5,4.1,11.9C418.2,74.5,417.3,77.7,415.7,78.7z"/>
                      </g>
                    </svg>
                  </div>
                )}
              </div>
            </button>

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

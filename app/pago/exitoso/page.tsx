'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

export default function PagoExitoso() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  
  const status = searchParams.get('collection_status') || searchParams.get('status')
  const paymentId = searchParams.get('collection_id') || searchParams.get('payment_id')

  useEffect(() => {
    // Si llegamos aquí vía MercadoPago y está aprobado, limpiamos el carrito
    if (status === 'approved' || !status) { 
      clearCart()
    }
  }, [status, clearCart])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-10 bg-surface-container border border-gold/20 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.1)]">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="square" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1
          className="text-4xl lg:text-5xl text-on-surface mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {status === 'approved' || !status ? '¡Gracias por tu compra!' : 'Procesando Pago'}
        </h1>

        <div className="prose prose-invert prose-p:text-on-surface-variant prose-p:font-serif mb-12">
          {status === 'approved' || !status ? (
            <>
              <p>
                Tu pago ha sido confirmado. Cada pieza de SKILGLASS nace de la tensión absoluta entre el fuego y la gravedad; pronto recibirás tu obra de luz molten.
              </p>
              {paymentId && (
                <p className="text-xs tracking-widest uppercase opacity-50 mt-4" style={{ fontFamily: 'var(--font-label)' }}>
                  ID OPERACIÓN: {paymentId}
                </p>
              )}
            </>
          ) : (
            <p>
              Estamos verificando el estado de tu transacción. Te notificaremos por email una vez completado el proceso.
            </p>
          )}
        </div>

        <Link
          href="/productos"
          className="inline-block border border-gold/30 text-gold px-10 py-4 text-[10px] tracking-[0.4em] uppercase transition-all duration-500 hover:bg-gold hover:text-surface-deep font-bold"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Explorar Más Catálogo
        </Link>
      </div>
    </div>
  )
}
'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PagoErrorContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('collection_status') || searchParams.get('status')

  useEffect(() => {
    // Si no hay params o el status es 'cancelled' (abandono), redirigir al carrito
    if (!status || status === 'cancelled' || status === 'null') {
      window.location.replace('/carrito')
    }
  }, [status])

  // Si estamos en proceso de redirección, no mostramos nada
  if (!status || status === 'cancelled' || status === 'null') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-deep">
        <div className="w-8 h-8 border-2 border-error/20 border-t-error rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-error/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Error icon */}
        <div className="w-20 h-20 mx-auto mb-10 bg-surface-container border border-error/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,180,171,0.05)]">
          <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1
          className="text-4xl lg:text-5xl text-on-surface mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Transacción Fallida
        </h1>

        <div className="prose prose-invert prose-p:text-on-surface-variant prose-p:font-serif mb-12">
          <p>
            No hemos podido procesar tu pago en este momento. Puede deberse a una interrupción en la conexión o limitaciones de la tarjeta seleccionada. Por favor, intenta nuevamente o contáctanos para asistencia personalizada.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/carrito"
            className="inline-block border border-gold/30 text-gold px-10 py-4 text-[10px] tracking-[0.4em] uppercase transition-all duration-500 hover:bg-gold hover:text-surface-deep font-bold"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Reintentar Pago
          </Link>
          <Link
            href="/"
            className="inline-block border border-outline-variant/30 text-on-surface-variant px-10 py-4 text-[10px] tracking-[0.4em] uppercase transition-all duration-500 hover:border-gold hover:text-gold font-bold"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PagoError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-deep">
        <div className="w-8 h-8 border-2 border-error/20 border-t-error rounded-full animate-spin" />
      </div>
    }>
      <PagoErrorContent />
    </Suspense>
  )
}
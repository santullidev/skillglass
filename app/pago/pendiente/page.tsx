import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago Pendiente | SKILGLASS',
}

export default function PagoPendiente() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-tertiary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Pending icon */}
        <div className="w-20 h-20 mx-auto mb-10 bg-surface-container border border-outline-variant/20 flex items-center justify-center shadow-[0_0_30px_rgba(184,115,51,0.05)]">
          <svg className="w-10 h-10 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="square" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1
          className="text-4xl lg:text-5xl text-on-surface mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Pago en Proceso
        </h1>

        <div className="prose prose-invert prose-p:text-on-surface-variant prose-p:font-serif mb-12">
          <p>
            Tu transacción está siendo verificada por Mercado Pago. Esto puede tardar unos minutos dependiendo del medio de pago elegido. Te enviaremos un correo apenas el cristal sea asignado a tu nombre.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block border border-outline-variant/30 text-on-surface-variant px-10 py-4 text-[10px] tracking-[0.4em] uppercase transition-all duration-500 hover:border-gold hover:text-gold font-bold"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}
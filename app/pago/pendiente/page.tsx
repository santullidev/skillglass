import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago Pendiente',
}

export default function PagoPendiente() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        {/* Pending icon */}
        <div className="w-20 h-20 mx-auto mb-8 bg-surface-container-high flex items-center justify-center">
          <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1
          className="text-3xl mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Pago pendiente
        </h1>

        <p className="text-on-surface-variant leading-relaxed mb-8">
          Tu pago está siendo procesado. Te avisaremos cuando se confirme.
          Esto puede tomar unos minutos dependiendo del medio de pago
          seleccionado.
        </p>

        <Link
          href="/"
          className="inline-block bg-primary-container text-primary px-8 py-4 text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[inset_0_0_30px_rgba(169,199,255,0.15)]"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  )
}
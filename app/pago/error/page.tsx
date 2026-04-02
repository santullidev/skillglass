import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Error en el Pago',
}

export default function PagoError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="w-20 h-20 mx-auto mb-8 bg-error-container flex items-center justify-center">
          <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1
          className="text-3xl mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Hubo un error
        </h1>

        <p className="text-on-surface-variant leading-relaxed mb-8">
          No se pudo procesar el pago. Podés intentarlo de nuevo o
          contactarnos por WhatsApp para recibir asistencia personalizada.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-block bg-primary-container text-primary px-8 py-4 text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[inset_0_0_30px_rgba(169,199,255,0.15)]"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¡Pago Exitoso!',
}

export default function PagoExitoso() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-8 bg-primary-container flex items-center justify-center caustic-glow">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1
          className="text-3xl mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ¡Pago exitoso!
        </h1>

        <p className="text-on-surface-variant leading-relaxed mb-8">
          Gracias por tu compra. Tu pieza de vitrofusión está siendo
          preparada con el mismo cuidado artesanal con el que fue creada.
          Te contactaremos pronto con los detalles del envío.
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
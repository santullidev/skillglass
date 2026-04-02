'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FooterProps {
  settings?: {
    email?: string;
    telefono?: string;
    direccion?: string;
    instagram?: string;
  };
}

export default function Footer({ settings }: FooterProps) {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/studio')) return null

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <span
              className="text-lg tracking-[0.25em] font-semibold text-on-surface block mb-4"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              SKILGLASS
            </span>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
              Estudio de diseño experimental enfocado en la refracción lumínica
              y la joyería de autor mediante técnicas puras de soplado a la flama.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href={settings?.instagram || "https://instagram.com/skilglass"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-outline hover:text-primary transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <Link
                href="/contacto"
                className="text-outline hover:text-primary transition-colors duration-300"
                aria-label="Contacto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h4
              className="text-xs tracking-[0.15em] uppercase text-outline mb-6"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Explorar
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/estudio"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300"
                >
                  El Estudio
                </Link>
              </li>
              <li>
                <Link
                  href="/colecciones"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300"
                >
                  Colecciones
                </Link>
              </li>
              <li>
                <Link
                  href="/#proceso"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300"
                >
                  Nuestro Manifiesto
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4
              className="text-xs tracking-[0.15em] uppercase text-outline mb-6"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Ayuda & Contacto
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/soporte"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300"
                >
                  Centro de Soporte
                </Link>
              </li>
              <li>
                <Link
                  href="/soporte#cuidados"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300"
                >
                  Cuidado del Cristal
                </Link>
              </li>
              <li>
                <Link
                  href="/soporte#envios"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300"
                >
                  Envíos y Tiempos
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-on-surface-variant text-sm hover:text-on-surface transition-colors duration-300 font-bold"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-outline text-xs" style={{ fontFamily: 'var(--font-label)' }}>
            © {new Date().getFullYear()} SKILGLASS. Todos los derechos reservados.
          </p>
          <p className="text-outline text-xs">
            Hecho con 🔥 en Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}

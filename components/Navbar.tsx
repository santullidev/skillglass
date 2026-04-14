'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

function CartIcon() {
  const { totalItems } = useCart()
  
  return (
    <Link href="/carrito" className="relative group text-on-surface hover:text-primary transition-colors duration-300 flex items-center justify-center p-2">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      {totalItems > 0 && (
        <span 
          className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold leading-none z-20 shadow-sm"
          style={{ 
            fontFamily: 'var(--font-label)',
            borderRadius: '9999px' // Usar inline para saltar el * { border-radius: 0 !important } de globals.css
          }}
        >
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't render Navbar in the studio - must be after hooks
  if (pathname?.startsWith('/studio')) return null

  const links = [
    { href: '/productos', label: 'Productos' },
    { href: '/capsulas', label: 'Cápsulas' },
    { href: '/#proceso', label: 'Proceso' },
    { href: '/#piezas', label: 'Piezas Únicas' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'glass-panel shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center">
            <Image
              src="/logo.png"
              alt="Skil Glass"
              width={140}
              height={40}
              className="object-contain transition-opacity duration-300 group-hover:opacity-80"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-on-surface-variant hover:text-on-surface text-sm tracking-wide transition-colors duration-300"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Cart Icon Desktop */}
            <CartIcon />
          </div>

          <div className="flex items-center gap-4 md:hidden">
            {/* Cart Icon Mobile */}
            <CartIcon />
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-on-surface p-2"
              aria-label="Menú"
            >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {mobileOpen ? (
                <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 z-100 bg-surface-deep/98 backdrop-blur-2xl md:hidden transition-all duration-700 ease-in-out ${
            mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Header inside mobile menu */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-outline-variant/10">
            <Image
              src="/logo.png"
              alt="Skil Glass"
              width={120}
              height={34}
              className="object-contain"
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gold p-2 hover:rotate-90 transition-transform duration-500"
              aria-label="Cerrar Menú"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links Container */}
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-10 px-6">
            {links.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-3xl sm:text-4xl text-center text-on-surface hover:text-gold transition-all duration-500 tracking-wider flex flex-col items-center group ${
                  mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ 
                  fontFamily: 'var(--font-display)',
                  transitionDelay: `${i * 100}ms`
                }}
              >
                <span className="italic font-light text-gold/40 text-xs tracking-[0.5em] mb-2 group-hover:text-gold transition-colors">0{i + 1}</span>
                {link.label}
                <div className="w-0 group-hover:w-full h-px bg-gold/30 mt-4 transition-all duration-700" />
              </Link>
            ))}
            
            {/* Mobile Footer in Menu */}
            <div className="mt-12 pt-12 border-t border-outline-variant/10 w-full text-center">
              <p className="text-[10px] tracking-[0.4em] text-outline-variant/60 uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                Joyería en Vidrio de Autor · Buenos Aires
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

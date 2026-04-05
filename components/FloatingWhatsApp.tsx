'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingWhatsAppProps {
  phone?: string
}

export default function FloatingWhatsApp({ phone }: FloatingWhatsAppProps) {
  const [isVisible, setIsVisible] = useState(false)
  const finalPhone = phone

  useEffect(() => {
    const toggleVisibility = () => {
      // Show after 100px of scroll for better visibility
      if (window.scrollY > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    // Run once on mount in case already scrolled
    toggleVisibility()
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!finalPhone) return null

  // Format phone: remove spaces and plus for the URL
  const whatsappUrl = `https://wa.me/${finalPhone.replace(/[^0-9]/g, '')}`

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 bg-surface/60 backdrop-blur-xl border border-primary/20 shadow-2xl hover:scale-105 transition-all duration-500"
            aria-label="Contactar por WhatsApp"
          >
            {/* Iridescent edge simulation (top and left highlight) */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/30 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-linear-to-b from-primary/30 to-transparent" />
            
            {/* Ambient Caustic Glow */}
            <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />

            {/* WhatsApp Icon (Thematic Baltic Blue) */}
            <svg 
              className="w-6 h-6 relative z-10 text-primary group-hover:scale-110 transition-transform duration-500" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>

            {/* Label Tooltip (Skilglass Editorial Style) */}
            <div className="absolute right-full mr-6 px-4 py-3 bg-surface-container-high border border-outline-variant/30 text-on-surface text-[9px] tracking-[0.3em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0 pointer-events-none" style={{ fontFamily: 'var(--font-label)' }}>
              ¿Tienes una consulta?
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

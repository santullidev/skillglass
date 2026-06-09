'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingWhatsAppProps {
  phone?: string
}

const OPCIONES = [
  {
    label: 'Consultar envíos al interior',
    mensaje: 'Hola Skil Glass! Quiero consultar sobre envíos al interior del país.',
    emoji: '📦',
  },
  {
    label: 'Diseño personalizado',
    mensaje: 'Hola Skil Glass! Me gustaría consultar sobre un diseño personalizado.',
    emoji: '✨',
  },
  {
    label: 'Quiero más información',
    mensaje: 'Hola Skil Glass! Quiero más información sobre sus productos.',
    emoji: '💎',
  },
  {
    label: 'Hacer una consulta',
    mensaje: 'Hola Skil Glass! Quiero hacer una consulta.',
    emoji: '💬',
  },
]

export default function FloatingWhatsApp({ phone }: FloatingWhatsAppProps) {
  const [open, setOpen] = useState(false)
  const finalPhone = phone

  if (!finalPhone) return null

  const waBase = `https://wa.me/${finalPhone.replace(/[^0-9]/g, '')}`

  return (
    <div
      className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Menú de opciones — aparece sobre el botón */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-col gap-2 items-end"
          >
            {OPCIONES.map((op, i) => (
              <motion.a
                key={op.label}
                href={`${waBase}?text=${encodeURIComponent(op.mensaje)}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.15 }}
                className="group flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-surface/90 backdrop-blur-xl border border-outline-variant/30 shadow-lg hover:border-primary/40 hover:bg-surface transition-all duration-300 cursor-pointer"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <span className="text-sm">{op.emoji}</span>
                <span className="text-[10px] text-on-surface tracking-[0.15em] uppercase whitespace-nowrap group-hover:text-primary transition-colors">
                  {op.label}
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón principal — estilo original del sitio */}
      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
        className="group relative flex items-center justify-center w-14 h-14 bg-surface/60 backdrop-blur-xl border border-primary/20 shadow-2xl hover:scale-105 transition-all duration-500"
        aria-label="Contactar por WhatsApp"
      >
        {/* Iridescent edge simulation */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-linear-to-b from-primary/30 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />

        {/* Pulso suave cuando el menú está abierto */}
        <AnimatePresence>
          {open && (
            <motion.span
              key="ping"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 bg-primary/20 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* WhatsApp Icon — color temático del sitio */}
        <svg
          className="w-6 h-6 relative z-10 text-primary group-hover:scale-110 transition-transform duration-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.535 5.878L.057 23.428a.75.75 0 00.968.892l5.878-1.935A11.928 11.928 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.722 9.722 0 01-4.953-1.355l-.355-.21-3.685 1.212 1.168-3.568-.228-.368A9.75 9.75 0 1112 21.75z" />
        </svg>
      </motion.button>
    </div>
  )
}

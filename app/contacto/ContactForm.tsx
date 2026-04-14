'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' })
      setTimeout(() => setIsSuccess(false), 5000)
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-surface-container-low/50 backdrop-blur-md p-10 lg:p-16 border border-outline-variant/10 shadow-2xl"
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group relative">
                <label className="text-[10px] tracking-widest uppercase text-primary mb-2 block font-bold">Tu Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Artemisa..."
                  className="w-full bg-transparent border-b border-outline-variant/60 py-4 text-on-surface focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                />
              </div>
              <div className="group relative">
                <label className="text-[10px] tracking-widest uppercase text-primary mb-2 block font-bold">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hola@ejemplo.com"
                  className="w-full bg-transparent border-b border-outline-variant/60 py-4 text-on-surface focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>

            <div className="group relative">
              <label className="text-[10px] tracking-widest uppercase text-primary mb-2 block font-bold">Asunto</label>
              <input
                type="text"
                name="asunto"
                required
                value={formData.asunto}
                onChange={handleChange}
                placeholder="Colaboración, Pedido especial..."
                className="w-full bg-transparent border-b border-outline-variant/60 py-4 text-on-surface focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>

            <div className="group relative">
              <label className="text-[10px] tracking-widest uppercase text-primary mb-2 block font-bold">Mensaje</label>
              <textarea
                name="mensaje"
                rows={4}
                required
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Escribe aquí tu mensaje..."
                className="w-full bg-transparent border-b border-outline-variant/60 py-4 text-on-surface focus:border-primary outline-none transition-all resize-none placeholder:text-on-surface-variant/40"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative group w-full py-6 mt-6 bg-surface-container border border-outline-variant/30 text-on-surface overflow-hidden transition-all hover:border-primary"
            >
              <div className="absolute inset-x-0 bottom-0 h-full bg-primary origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10 text-[10px] tracking-[0.5em] uppercase font-bold group-hover:text-surface transition-colors">
                {isSubmitting ? 'Encendiendo el Fuego...' : 'Enviar Mensaje'}
              </span>
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 flex items-center justify-center mx-auto mb-10 rounded-full border border-primary/20">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl text-on-surface mb-6 font-serif italic">Gesto Recibido</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto mb-10">
              Tu mensaje ha viajado hasta nuestro estudio. Te responderemos en cuanto la flama se apague.
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-[9px] tracking-widest uppercase text-primary border-b border-primary/30 pb-1"
            >
              Enviar otro mensaje
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/lib/cart-context'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PROVINCIAS_ARGENTINA = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", 
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", 
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", 
  "Santiago del Estero", "Tierra del Fuego", "Tucumán"
]

export default function DatosEnvioPage() {
  const { items, totalPrice } = useCart()
  const router = useRouter()
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const formRef = useRef<HTMLFormElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    provincia: '',
    ciudad: '',
    direccion: '',
    codigoPostal: '',
    notas: '',
  })

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (key) {
      initMercadoPago(key, { locale: 'es-AR' })
    }
  }, [])

  const validateField = (name: string, value: string) => {
    let error = ''
    const trimmedValue = value.trim()

    switch (name) {
      case 'nombre':
        if (!trimmedValue) error = 'El nombre es requerido'
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(trimmedValue)) error = 'Solo se permiten letras y espacios'
        else if (trimmedValue.length < 3) error = 'Mínimo 3 caracteres'
        else if (trimmedValue.length > 60) error = 'Máximo 60 caracteres'
        else if (trimmedValue.split(' ').filter(p => p.length > 0).length < 2) error = 'Ingresa al menos nombre y apellido'
        break
      case 'email':
        if (!trimmedValue) error = 'El email es requerido'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) error = 'Email inválido'
        break
      case 'telefono':
        if (!trimmedValue) error = 'El teléfono es requerido'
        else if (!/^[\d\s\-\+\(\)]+$/.test(trimmedValue)) error = 'Formato inválido'
        const digits = trimmedValue.replace(/\D/g, '')
        if (digits.length < 10) error = 'Mínimo 10 dígitos'
        else if (trimmedValue.length > 20) error = 'Demasiado largo'
        break
      case 'provincia':
        if (!trimmedValue) error = 'Selecciona una provincia'
        break
      case 'ciudad':
        if (!trimmedValue) error = 'La ciudad es requerida'
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-]+$/.test(trimmedValue)) error = 'Solo letras, espacios y guiones'
        else if (trimmedValue.length < 2) error = 'Mínimo 2 caracteres'
        break
      case 'codigoPostal':
        if (!trimmedValue) error = 'El CP es requerido'
        else if (!/^\d{4}([A-Z]{3})?$/.test(trimmedValue)) error = 'Formato CP inválido (Ej: 7600 o B1640HRR)'
        break
      case 'direccion':
        if (!trimmedValue) error = 'La dirección es requerida'
        else if (trimmedValue.length < 5) error = 'Mínimo 5 caracteres'
        else if (!/\d/.test(trimmedValue)) error = 'Debe incluir el número de calle'
        break
    }

    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue = value

    // Normalizaciones en tiempo real
    if (name === 'codigoPostal') processedValue = value.toUpperCase().slice(0, 8)
    if (name === 'email') processedValue = value.toLowerCase()
    if (name === 'telefono' && value.startsWith('0')) processedValue = '+54 ' + value.slice(1)

    setFormData(prev => ({ ...prev, [name]: processedValue }))
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    const fieldsToValidate = ['nombre', 'email', 'telefono', 'provincia', 'ciudad', 'codigoPostal', 'direccion']
    let isValid = true
    let firstErrorField = ''

    fieldsToValidate.forEach(field => {
      const isFieldValid = validateField(field, (formData as any)[field])
      if (!isFieldValid) {
        isValid = false
        if (!firstErrorField) firstErrorField = field
      }
    })

    if (!isValid) {
      const errorElement = document.getElementsByName(firstErrorField)[0]
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        errorElement.focus()
      }
      return
    }

    setIsLoading(true)

    try {
      // Sanitización final antes de enviar
      const sanitizedData = { ...formData }
      Object.keys(sanitizedData).forEach(key => {
        (sanitizedData as any)[key] = (sanitizedData as any)[key].trim()
      })

      const response = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items,
          shippingData: sanitizedData 
        }),
      })

      const data = await response.json()
      if (data.id) {
        setPreferenceId(data.id)
        setFormSubmitted(true)
      } else if (data.error) {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error al crear preferencia:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0 && !formSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl mb-4 font-serif">Tu carrito está vacío</h1>
        <Link href="/productos" className="text-gold underline font-serif italic">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl text-on-surface mb-8 border-b border-outline-variant/20 pb-6" style={{ fontFamily: 'var(--font-display)' }}>
        Datos de Envío
      </h1>

      {!formSubmitted ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Completo */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Nombre Completo *</label>
              <input 
                required 
                autoComplete="name"
                name="nombre" 
                value={formData.nombre} 
                onChange={handleInputChange} 
                onBlur={() => validateField('nombre', formData.nombre)}
                className={`w-full bg-surface-container/30 border ${errors.nombre ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors`}
              />
              {errors.nombre && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Email de contacto *</label>
              <input 
                required 
                type="email" 
                autoComplete="email"
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                onBlur={() => validateField('email', formData.email)}
                className={`w-full bg-surface-container/30 border ${errors.email ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors`}
              />
              {errors.email && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Teléfono *</label>
              <input 
                required 
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                name="telefono" 
                placeholder="+54 9 ..."
                value={formData.telefono} 
                onChange={handleInputChange} 
                onBlur={() => validateField('telefono', formData.telefono)}
                className={`w-full bg-surface-container/30 border ${errors.telefono ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors`}
              />
              {errors.telefono && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.telefono}</p>}
            </div>

            {/* Provincia */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Provincia *</label>
              <select 
                required 
                name="provincia" 
                value={formData.provincia} 
                onChange={handleInputChange} 
                onBlur={() => validateField('provincia', formData.provincia)}
                className={`w-full bg-surface-container-low border ${errors.provincia ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none`}
              >
                <option value="">Seleccionar Provincia...</option>
                {PROVINCIAS_ARGENTINA.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.provincia && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.provincia}</p>}
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Ciudad *</label>
              <input 
                required 
                name="ciudad" 
                autoComplete="address-level2"
                value={formData.ciudad} 
                onChange={handleInputChange} 
                onBlur={() => validateField('ciudad', formData.ciudad)}
                className={`w-full bg-surface-container/30 border ${errors.ciudad ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors`}
              />
              {errors.ciudad && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.ciudad}</p>}
            </div>

            {/* Código Postal */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase opacity-70">Código Postal *</label>
              <input 
                required 
                name="codigoPostal" 
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="7600"
                value={formData.codigoPostal} 
                onChange={handleInputChange} 
                onBlur={() => validateField('codigoPostal', formData.codigoPostal)}
                className={`w-full bg-surface-container/30 border ${errors.codigoPostal ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors`}
              />
              {errors.codigoPostal && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.codigoPostal}</p>}
            </div>
          </div>
          
          {/* Dirección */}
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase opacity-70">Dirección (Calle y Número) *</label>
            <input 
              required 
              name="direccion" 
              autoComplete="address-line1"
              value={formData.direccion} 
              onChange={handleInputChange} 
              onBlur={() => validateField('direccion', formData.direccion)}
              placeholder="Ej: Colon 1234"
              className={`w-full bg-surface-container/30 border ${errors.direccion ? 'border-primary' : 'border-outline-variant/20'} p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors`}
            />
            {errors.direccion && <p className="text-[10px] text-primary italic lowercase tracking-wider">{errors.direccion}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase opacity-70">Notas / Instrucciones (Opcional)</label>
            <textarea 
              name="notas" 
              value={formData.notas} 
              onChange={handleInputChange} 
              rows={3} 
              placeholder="Timbre, departamento, etc."
              className="w-full bg-surface-container/30 border border-outline-variant/20 p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-on-surface text-surface py-5 px-6 font-bold tracking-[0.3em] uppercase text-xs transition-all hover:bg-on-surface/90 disabled:opacity-50 relative overflow-hidden group"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-surface/20 border-t-surface rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              'Confirmar Datos y Pagar'
            )}
            <div className="absolute inset-0 bg-primary/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />
          </button>
        </form>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-surface-container/30 border border-outline-variant/20 p-8 shadow-sm">
            <h2 className="text-xl mb-6 font-serif border-b border-outline-variant/10 pb-4">Confirmación de Envío</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm opacity-80">
              <span className="text-[10px] uppercase tracking-widest">Destinatario</span>
              <span className="text-right">{formData.nombre}</span>
              <span className="text-[10px] uppercase tracking-widest">Email</span>
              <span className="text-right">{formData.email}</span>
              <span className="text-[10px] uppercase tracking-widest">Dirección</span>
              <span className="text-right">{formData.direccion}, {formData.ciudad}</span>
              <span className="text-[10px] uppercase tracking-widest">Provincia</span>
              <span className="text-right">{formData.provincia}</span>
              <span className="text-[10px] uppercase tracking-widest">Total Compra</span>
              <span className="text-right font-bold text-primary">$ {totalPrice.toLocaleString('es-AR')} ARS</span>
            </div>
          </div>

          <div className="wallet-container max-w-sm mx-auto">
            {preferenceId && (
              <Wallet 
                initialization={{ preferenceId }} 
                customization={{
                  valueProp: 'practicality',
                  customStyle: {
                    buttonBackground: 'default',
                    borderRadius: '6px',
                  }
                }}
              />
            )}
          </div>
          
          <button 
            onClick={() => {
              setFormSubmitted(false)
              setPreferenceId(null)
            }}
            className="w-full text-[10px] tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity font-bold underline underline-offset-4"
          >
            Editar datos de envío
          </button>
        </div>
      )}
    </div>
  )
}

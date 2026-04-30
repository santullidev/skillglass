'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", 
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", 
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", 
  "Santiago del Estero", "Tierra del Fuego", "Tucumán"
]

export default function EnvioPage() {
  const { items, totalPrice } = useCart()
  
  // State del Proceso


  const [isLoading, setIsLoading] = useState(false)
  const [isQuoting, setIsQuoting] = useState(false)
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [usandoFallback, setUsandoFallback] = useState(false)
  
  // Form Data
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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)



  // Si el carrito está vacío
  if (items.length === 0) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <h1 className="text-2xl mb-4 font-serif text-on-surface">Tu carrito está vacío</h1>
        <Link href="/" className="text-primary underline font-serif italic">Volver al inicio</Link>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    // Resetear cotización si cambia el CP o tipo
    if (name === 'codigoPostal') setShippingCost(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Nombre y apellido
    const nombre = formData.nombre.trim()
    if (!nombre || nombre.split(' ').filter(Boolean).length < 2) {
      newErrors.nombre = 'Ingresá nombre y apellido completos'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombre)) {
      newErrors.nombre = 'Solo letras, sin números ni caracteres especiales'
    }

    // Email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresá un email válido'
    }

    // Teléfono — al menos 10 dígitos numéricos
    if (!formData.telefono || formData.telefono.replace(/\D/g, '').length < 10) {
      newErrors.telefono = 'Ingresá el teléfono con código de área (mín. 10 dígitos)'
    }

    // Código postal
    if (!formData.codigoPostal || !/^\d{4}([A-Z]{3})?$/.test(formData.codigoPostal)) {
      newErrors.codigoPostal = 'CP inválido (ej: 7600 o 1414ABC)'
    }

    // Campos de domicilio obligatorios
    if (!formData.direccion || formData.direccion.trim().length < 2) {
      newErrors.direccion = 'Ingresá la dirección'
    }
    if (!formData.ciudad || formData.ciudad.trim().length < 2) {
      newErrors.ciudad = 'Ingresá la ciudad'
    }
    if (!formData.provincia) {
      newErrors.provincia = 'Seleccioná la provincia'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalcularEnvio = async () => {
    if (!formData.codigoPostal) {
      setErrors({ codigoPostal: 'Ingresá el CP para cotizar' })
      return
    }

    setIsQuoting(true)

    try {
      const res = await fetch('/api/andreani/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpDestino: formData.codigoPostal, items })
      })
      const data = await res.json()
      
      if (data.cotizaciones) {
        const quote = data.cotizaciones.find((c: any) => c.tipo === 'domicilio')
        if (quote) {
          setShippingCost(quote.tarifa)
          setUsandoFallback(data.fallback === true)
        } else {
          alert('No encontramos métodos de Andreani para este CP.')
        }
      }
    } catch (err) {
      console.error(err)
      alert('Error calculando el envío. Intentá de nuevo.')
    } finally {
      setIsQuoting(false)
    }
  }

  const handleFinalizarYPay = async () => {
    if (!validateForm()) {
      // Scroll al primer error
      const firstErrorEl = document.querySelector('[data-error="true"]')
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    setIsLoading(true)
    setServerError(null)

    try {
      const response = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items,
          montoEnvio: shippingCost,
          shippingData: {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            provincia: formData.provincia,
            ciudad: formData.ciudad,
            direccion: formData.direccion,
            codigoPostal: formData.codigoPostal,
            notas: formData.notas,
            tipoEnvio: 'domicilio',
          } 
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Mapear el mensaje de error del servidor al campo correcto
        const serverField = data.error?.replace('Campo inválido o faltante: ', '')
        if (serverField) {
          setErrors(prev => ({
            ...prev,
            [serverField]: `${serverField} inválido o faltante`
          }))
          // Scroll al campo con error
          setTimeout(() => {
            document.querySelector(`[name="${serverField}"]`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
        } else {
          setServerError(data.error || 'Ocurrió un error al procesar el pago')
        }
        setIsLoading(false)
        return
      }

      if (data.url) {
        // Redirigir a Mercado Pago Checkout Pro
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      setServerError('Ocurrió un error inesperado. Por favor intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif italic mb-12 text-on-surface">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* COLUMNA IZQUIERDA: DATOS Y ENVIO */}
          <section className="lg:w-7/12 w-full space-y-12">
            
            {/* FORMULARIO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-xs font-bold text-primary">01</span>
                <h2 className="text-xl font-serif text-on-surface">Tus datos</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container/40 p-8 border border-outline-variant rounded-[8px]">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Nombre Completo</label>
                  <input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    data-error={!!errors.nombre}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
                      ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.nombre}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    data-error={!!errors.email}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
                      ${errors.email ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                    placeholder="ejemplo@correo.com"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Teléfono</label>
                  <input
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    data-error={!!errors.telefono}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
                      ${errors.telefono ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                    placeholder="11 2345 6789"
                  />
                  {errors.telefono && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.telefono}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Código Postal</label>
                  <input
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    data-error={!!errors.codigoPostal}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] font-bold transition-colors
                      ${errors.codigoPostal ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                    placeholder="7600"
                  />
                  {errors.codigoPostal && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.codigoPostal}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Dirección</label>
                  <input
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    data-error={!!errors.direccion}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
                      ${errors.direccion ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                  />
                  {errors.direccion && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.direccion}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Ciudad</label>
                  <input
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    data-error={!!errors.ciudad}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
                      ${errors.ciudad ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                  />
                  {errors.ciudad && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.ciudad}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Provincia</label>
                  <select
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleInputChange}
                    data-error={!!errors.provincia}
                    className={`w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
                      ${errors.provincia ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`}
                  >
                    <option value="">Seleccionar...</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.provincia && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.provincia}</p>
                  )}
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    onClick={handleCalcularEnvio}
                    disabled={isQuoting}
                    className="bg-primary text-on-primary py-4 px-10 text-[10px] tracking-[0.3em] uppercase font-bold hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {isQuoting ? 'Calculando...' : 'Calcular Envío →'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* COLUMNA DERECHA: RESUMEN Y PAGO */}
          <section className="lg:w-5/12 w-full sticky top-32">
            <div className="bg-surface-container/30 border border-outline-variant/30 p-8 rounded-[8px] space-y-8">
              <h2 className="text-xl font-serif text-on-surface border-b border-outline-variant/20 pb-4">Resumen</h2>
              
              {/* LISTA ITEMS */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface uppercase tracking-wider">{item.nombre}</span>
                      <span className="text-[10px] opacity-60">Cant: {item.cantidad}</span>
                    </div>
                    <span className="font-serif italic">$ {(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              {/* COSTOS */}
              <div className="pt-6 border-t border-outline-variant/20 space-y-3 text-xs tracking-widest uppercase">
                <div className="flex justify-between opacity-60">
                  <span>Subtotal</span>
                  <span>$ {totalPrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-primary font-bold">
                  <span>Envío Andreani</span>
                  <span>{shippingCost !== null ? `$ ${shippingCost.toLocaleString('es-AR')}` : '---'}</span>
                </div>
                {usandoFallback && shippingCost !== null && (
                  <p className="text-[10px] text-on-surface/50 normal-case tracking-normal">
                    * Costo estimado por zona. Se confirma al despachar.
                  </p>
                )}
                <div className="flex justify-between text-lg font-bold pt-4 text-on-surface border-t border-outline-variant/10">
                  <span className="font-serif italic capitalize tracking-normal">Total</span>
                  <span>$ {(totalPrice + (shippingCost || 0)).toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* ACCIONES DE PAGO */}
              <div className="pt-8 space-y-4">
                {serverError && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-[4px] text-xs text-red-600 flex gap-3 items-center">
                    <span>⚠️</span>
                    <p>{serverError}</p>
                  </div>
                )}

                {shippingCost === null ? (
                  <div className="border border-dashed border-on-surface/20 p-6 text-center">
                    <p className="text-[10px] text-on-surface/50 tracking-widest uppercase leading-relaxed">
                      Completá los datos y calculá el envío para continuar
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleFinalizarYPay}
                    disabled={isLoading}
                    className="w-full bg-on-surface text-white py-5 px-6 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-on-surface/90 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Redirigiendo a Mercado Pago...' : `Pagar $ ${(totalPrice + shippingCost).toLocaleString('es-AR')} →`}
                  </button>
                )}
              </div>

              <p className="text-[9px] text-center opacity-40 uppercase tracking-widest">Transacción Segura por Mercado Pago</p>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}

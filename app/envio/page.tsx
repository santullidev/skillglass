'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCart } from '@/lib/cart-context'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", 
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", 
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", 
  "Santiago del Estero", "Tierra del Fuego", "Tucumán"
]

export default function EnvioPage() {
  const { items, totalPrice } = useCart()
  const router = useRouter()
  
  // State del Proceso
  const [step, setStep] = useState(1) // 1: Tipo, 2: Datos, 3: Pago
  const [tipoEnvio, setTipoEnvio] = useState<'domicilio' | 'sucursal'>('domicilio')
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isQuoting, setIsQuoting] = useState(false)
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  
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

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (key) {
      initMercadoPago(key, { locale: 'es-AR' })
    }
  }, [])

  // Si el carrito está vacío, volver
  if (items.length === 0 && step < 3) {
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
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre) newErrors.nombre = 'Requerido'
    if (!formData.email || !formData.email.includes('@')) newErrors.email = 'Email inválido'
    if (!formData.telefono) newErrors.telefono = 'Requerido'
    if (!formData.codigoPostal) newErrors.codigoPostal = 'Requerido'
    if (tipoEnvio === 'domicilio') {
      if (!formData.direccion) newErrors.direccion = 'Requerido'
      if (!formData.provincia) newErrors.provincia = 'Requerido'
      if (!formData.ciudad) newErrors.ciudad = 'Requerido'
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
        const quote = data.cotizaciones.find((c: any) => c.tipo === tipoEnvio)
        if (quote) {
          setShippingCost(quote.tarifa)
          setStep(3) // Avanzar al resumen si cotizó bien
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
    setIsLoading(true)
    try {
      const response = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items,
          montoEnvio: shippingCost,
          shippingData: {
            ...formData,
            tipoEnvio
          } 
        }),
      })

      const data = await response.json()
      if (data.id) {
        setPreferenceId(data.id)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-12">
        
        {/* PASO 1: TIPO DE ENVIO */}
        <section className={`transition-all duration-500 ${step > 1 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-xs font-bold text-primary">01</span>
            <h2 className="text-2xl font-serif text-on-surface">¿Cómo querés recibir tu pieza?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setTipoEnvio('domicilio')}
              className={`p-6 border transition-all flex flex-col items-center gap-3 ${tipoEnvio === 'domicilio' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-primary/40'}`}
            >
              <span className="text-2xl">🏠</span>
              <span className="text-xs tracking-widest uppercase font-bold text-on-surface">A domicilio</span>
              <p className="text-[10px] text-on-surface-variant text-center leading-relaxed">Entregamos en la puerta de tu casa a través de Andreani Express.</p>
            </button>
            <button 
              onClick={() => setTipoEnvio('sucursal')}
              className={`p-6 border transition-all flex flex-col items-center gap-3 ${tipoEnvio === 'sucursal' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-primary/40'}`}
            >
              <span className="text-2xl">🏪</span>
              <span className="text-xs tracking-widest uppercase font-bold text-on-surface">Retiro en Sucursal</span>
              <p className="text-[10px] text-on-surface-variant text-center leading-relaxed">Retirá en la sucursal de Andreani más cercana a tu ubicación.</p>
            </button>
          </div>
          
          {step === 1 && (
            <button 
              onClick={() => setStep(2)}
              className="mt-8 bg-on-surface text-white py-4 px-12 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-on-surface/90 transition-all font-serif italic"
            >
              Siguiente →
            </button>
          )}
        </section>

        {/* PASO 2: DATOS */}
        <section className={`transition-all duration-500 ${step < 2 ? 'opacity-30 translate-y-4' : step > 2 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
           <div className={`flex items-center gap-4 mb-8 transition-colors ${step === 2 ? 'text-on-surface' : 'text-on-surface/40'}`}>
            <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-xs font-bold text-primary">02</span>
            <h2 className="text-2xl font-serif text-on-surface">Tus datos de envío</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-low/60 p-10 border border-outline-variant/30 rounded-[8px]">
            <div className="space-y-3">
              <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Nombre Completo</label>
              <input name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none rounded-[4px]" placeholder="Ej: Juan Pérez" />
              {errors.nombre && <span className="text-[9px] text-primary italic font-bold">{errors.nombre}</span>}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none rounded-[4px]" placeholder="ejemplo@correo.com" />
              {errors.email && <span className="text-[9px] text-primary italic font-bold">{errors.email}</span>}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Teléfono</label>
              <input name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none rounded-[4px]" placeholder="11 2345 6789" />
              {errors.telefono && <span className="text-[9px] text-primary italic font-bold">{errors.telefono}</span>}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Código Postal</label>
              <input name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none rounded-[4px]" placeholder="7600" />
              {errors.codigoPostal && <span className="text-[9px] text-primary italic font-bold">{errors.codigoPostal}</span>}
            </div>
            
            {tipoEnvio === 'domicilio' && (
              <>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Calle y Número</label>
                  <input name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none rounded-[4px]" />
                  {errors.direccion && <span className="text-[9px] text-primary italic font-bold">{errors.direccion}</span>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Ciudad</label>
                  <input name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none rounded-[4px]" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface/80">Provincia</label>
                  <select name="provincia" value={formData.provincia} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-[4px] transition-all">
                    <option value="">Seleccionar...</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {step === 2 && (
            <div className="mt-8 flex gap-4">
              <button onClick={() => setStep(1)} className="text-[10px] tracking-widest uppercase underline opacity-60">Volver</button>
              <button 
                onClick={handleCalcularEnvio}
                disabled={isQuoting}
                className="bg-primary text-on-primary py-4 px-12 text-[10px] tracking-[0.3em] uppercase font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isQuoting ? 'Calculando...' : 'Calcular Envío'}
              </button>
            </div>
          )}
        </section>

        {/* PASO 3: RESUMEN Y PAGO */}
        <section className={`transition-all duration-500 ${step < 3 ? 'opacity-20 translate-y-4' : ''}`}>
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-xs font-bold text-primary">03</span>
            <h2 className="text-2xl font-serif text-on-surface">Resumen y Pago</h2>
          </div>

          {step === 3 && (
            <div className="bg-surface-container/40 p-10 border border-primary/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
               
               <div className="space-y-6 relative z-10">
                 <div className="flex justify-between text-xs tracking-widest uppercase opacity-70">
                   <span>Subtotal</span>
                   <span>$ {totalPrice.toLocaleString('es-AR')} ARS</span>
                 </div>
                 <div className="flex justify-between text-xs tracking-widest uppercase text-primary font-bold">
                   <span>Envío Andreani {tipoEnvio === 'domicilio' ? 'Home' : 'Sucursal'}</span>
                   <span>$ {shippingCost?.toLocaleString('es-AR')} ARS</span>
                 </div>
                 <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-end">
                   <div className="flex flex-col">
                     <span className="text-[9px] tracking-[0.4em] uppercase opacity-50 mb-1">Total a pagar</span>
                     <span className="text-3xl font-bold text-on-surface">$ {(totalPrice + (shippingCost || 0)).toLocaleString('es-AR')} ARS</span>
                   </div>
                   
                   {!preferenceId ? (
                     <button 
                       onClick={handleFinalizarYPay}
                       disabled={isLoading}
                       className="bg-on-surface text-surface py-5 px-10 text-[11px] tracking-[0.3em] uppercase font-bold hover:bg-primary transition-colors disabled:opacity-50"
                     >
                       {isLoading ? 'Conectando...' : 'Pagar con Mercado Pago'}
                     </button>
                   ) : (
                     <div className="w-full max-w-[280px]">
                        <Wallet initialization={{ preferenceId }} customization={{ valueProp: 'practicality' }} />
                     </div>
                   )}
                 </div>
               </div>
               
               <button 
                onClick={() => setStep(2)}
                className="mt-12 text-[9px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity"
               >
                 ← Modificar dirección o método
               </button>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

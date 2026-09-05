'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán"
]

type TipoEnvio = 'domicilio' | 'sucursal'

interface Cotizacion {
  tipo: TipoEnvio
  tarifa: number
}

interface Sucursal {
  id: number
  nomenclatura?: string
  descripcion: string
  calle: string
  numero: string
  localidad: string
  codigoPostal: string
  horario: string
}

interface EnvioClientProps {
  /** Número de WhatsApp tal como viene de Sanity (ej: "+5492235584416") */
  whatsappPhone: string
}

const CP_VALIDO = /^\d{4}([A-Za-z]{3})?$/

const inputClass = (hasError: boolean) =>
  `w-full bg-white border p-3 text-sm focus:border-primary outline-none rounded-[4px] transition-colors
   ${hasError ? 'border-red-500 bg-red-50' : 'border-on-surface/20'}`

export default function EnvioClient({ whatsappPhone }: EnvioClientProps) {
  const { items, totalPrice } = useCart()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    provincia: '',
    ciudad: '',
    codigoPostal: '',
    calle: '',
    numero: '',
    piso: '',
    departamento: '',
    notas: '',
  })

  // Cotización y sucursales
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('domicilio')
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[] | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalId, setSucursalId] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const waPhone = whatsappPhone.replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent('Hola! Quiero consultar sobre el envío de mi pedido.')}`

  const shippingCost = cotizaciones?.find((c) => c.tipo === tipoEnvio)?.tarifa ?? null
  const sucursalElegida = sucursales.find((s) => String(s.id) === sucursalId)

  // El carrito vive en localStorage y `items` cambia de identidad en cada render,
  // así que la cotización se dispara sólo cuando cambia el CP o el contenido real.
  const cartKey = items.map((i) => `${i.id}:${i.cantidad}`).join('|')
  const itemsRef = useRef(items)
  itemsRef.current = items

  const cotizar = useCallback(async (cp: string) => {
    setIsQuoting(true)
    setQuoteError(null)

    try {
      const [resCotizacion, resSucursales] = await Promise.all([
        fetch('/api/andreani/cotizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpDestino: cp, items: itemsRef.current }),
        }),
        fetch(`/api/andreani/sucursales?cp=${encodeURIComponent(cp)}`),
      ])

      const dataCotizacion = await resCotizacion.json()
      if (!resCotizacion.ok) throw new Error(dataCotizacion.error || 'No se pudo cotizar el envío')
      setCotizaciones(dataCotizacion.cotizaciones || [])

      // Las sucursales son un extra: si fallan, el envío a domicilio sigue andando.
      if (resSucursales.ok) {
        const dataSucursales = await resSucursales.json()
        setSucursales(dataSucursales.sucursales || [])
      } else {
        setSucursales([])
      }
    } catch (error) {
      console.error('Error al cotizar:', error)
      setCotizaciones(null)
      setSucursales([])
      setQuoteError('No pudimos calcular el envío para ese código postal. Revisalo o escribinos.')
    } finally {
      setIsQuoting(false)
    }
  }, [])

  useEffect(() => {
    const cp = formData.codigoPostal.trim()

    if (!CP_VALIDO.test(cp) || items.length === 0) {
      setCotizaciones(null)
      setSucursales([])
      return
    }

    const timer = setTimeout(() => cotizar(cp), 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.codigoPostal, cartKey, cotizar])

  // Si el cliente eligió sucursal y cambia el CP, la sucursal anterior ya no sirve.
  // Andreani tiene una sola sucursal B2C por CP salvo en 4 casos de todo el país,
  // así que cuando hay una sola la preseleccionamos y le ahorramos el clic.
  useEffect(() => {
    if (sucursales.some((s) => String(s.id) === sucursalId)) return
    setSucursalId(sucursales.length === 1 ? String(sucursales[0].id) : '')
  }, [sucursales, sucursalId])

  // Si el CP nuevo no tiene sucursales, volvemos a domicilio para no dejar al
  // cliente trabado en una opción sin alternativas.
  useEffect(() => {
    if (tipoEnvio === 'sucursal' && cotizaciones && sucursales.length === 0) {
      setTipoEnvio('domicilio')
    }
  }, [tipoEnvio, cotizaciones, sucursales])

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <h1 className="text-2xl mb-4 font-serif text-on-surface">Tu carrito está vacío</h1>
        <Link href="/" className="text-primary underline font-serif italic">Volver al inicio</Link>
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const nombre = formData.nombre.trim()
    if (!nombre || nombre.split(' ').filter(Boolean).length < 2) {
      newErrors.nombre = 'Ingresá nombre y apellido completos'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombre)) {
      newErrors.nombre = 'Solo letras, sin números ni caracteres especiales'
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresá un email válido'
    }

    if (!formData.telefono || formData.telefono.replace(/\D/g, '').length < 10) {
      newErrors.telefono = 'Ingresá el teléfono con código de área (mín. 10 dígitos)'
    }

    // Andreani exige el DNI de quien recibe el paquete
    if (!/^\d{7,8}$/.test(formData.dni.replace(/\D/g, ''))) {
      newErrors.dni = 'Ingresá el DNI sin puntos (7 u 8 dígitos)'
    }

    if (!CP_VALIDO.test(formData.codigoPostal)) {
      newErrors.codigoPostal = 'CP inválido (ej: 7600 o 1414ABC)'
    }

    if (!formData.ciudad || formData.ciudad.trim().length < 2) {
      newErrors.ciudad = 'Ingresá la ciudad'
    }
    if (!formData.provincia) {
      newErrors.provincia = 'Seleccioná la provincia'
    }

    if (tipoEnvio === 'domicilio') {
      if (!formData.calle || formData.calle.trim().length < 2) {
        newErrors.calle = 'Ingresá la calle'
      }
      if (!formData.numero.trim()) {
        newErrors.numero = 'Ingresá la altura'
      }
    } else if (!sucursalId) {
      newErrors.sucursalId = 'Elegí una sucursal para retirar'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFinalizarYPay = async () => {
    if (!validateForm()) {
      const firstErrorEl = document.querySelector('[data-error="true"]')
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (shippingCost === null) {
      setServerError('Todavía estamos calculando el envío. Esperá un segundo e intentá de nuevo.')
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
          shippingData: {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            dni: formData.dni.replace(/\D/g, ''),
            provincia: formData.provincia,
            ciudad: formData.ciudad,
            codigoPostal: formData.codigoPostal,
            calle: formData.calle,
            numero: formData.numero,
            piso: formData.piso,
            departamento: formData.departamento,
            notas: formData.notas,
            tipoEnvio,
            sucursalId,
            sucursalNombre: sucursalElegida?.descripcion || '',
            sucursalNomenclatura: sucursalElegida?.nomenclatura || '',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const serverField = data.error?.replace('Campo inválido o faltante: ', '')
        if (serverField && serverField !== data.error) {
          setErrors((prev) => ({ ...prev, [serverField]: `${serverField} inválido o faltante` }))
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
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      setServerError('Ocurrió un error inesperado. Por favor intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const tarifaDe = (tipo: TipoEnvio) => cotizaciones?.find((c) => c.tipo === tipo)?.tarifa ?? null

  return (
    <main className="min-h-screen bg-surface pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif italic mb-12 text-on-surface">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* COLUMNA IZQUIERDA: DATOS Y ENVIO */}
          <section className="lg:w-7/12 w-full space-y-12">

            {/* 01 — DATOS PERSONALES */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-xs font-bold text-primary">01</span>
                <h2 className="text-xl font-serif text-on-surface">Tus datos</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container/40 p-8 border border-outline-variant rounded-[8px]">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Nombre Completo</label>
                  <input name="nombre" value={formData.nombre} onChange={handleInputChange}
                    data-error={!!errors.nombre} className={inputClass(!!errors.nombre)} placeholder="Juan Pérez" />
                  {errors.nombre && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange}
                    data-error={!!errors.email} className={inputClass(!!errors.email)} placeholder="ejemplo@correo.com" />
                  {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Teléfono</label>
                  <input name="telefono" value={formData.telefono} onChange={handleInputChange}
                    data-error={!!errors.telefono} className={inputClass(!!errors.telefono)} placeholder="11 2345 6789" />
                  {errors.telefono && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.telefono}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">DNI de quien recibe</label>
                  <input name="dni" value={formData.dni} onChange={handleInputChange}
                    data-error={!!errors.dni} className={inputClass(!!errors.dni)} placeholder="30123456" inputMode="numeric" />
                  {errors.dni
                    ? <p className="text-[11px] text-red-500 font-medium mt-1">{errors.dni}</p>
                    : <p className="text-[10px] text-on-surface/45 mt-1">Andreani lo pide al momento de la entrega.</p>}
                </div>
              </div>
            </div>

            {/* 02 — DESTINO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-xs font-bold text-primary">02</span>
                <h2 className="text-xl font-serif text-on-surface">Destino</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container/40 p-8 border border-outline-variant rounded-[8px]">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Código Postal</label>
                  <input name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange}
                    data-error={!!errors.codigoPostal}
                    className={`${inputClass(!!errors.codigoPostal)} font-bold`} placeholder="7600" inputMode="numeric" />
                  {errors.codigoPostal
                    ? <p className="text-[11px] text-red-500 font-medium mt-1">{errors.codigoPostal}</p>
                    : <p className="text-[10px] text-on-surface/45 mt-1">Con esto calculamos el costo exacto del envío.</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Provincia</label>
                  <select name="provincia" value={formData.provincia} onChange={handleInputChange}
                    data-error={!!errors.provincia} className={inputClass(!!errors.provincia)}>
                    <option value="">Seleccionar...</option>
                    {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.provincia && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.provincia}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Ciudad / Localidad</label>
                  <input name="ciudad" value={formData.ciudad} onChange={handleInputChange}
                    data-error={!!errors.ciudad} className={inputClass(!!errors.ciudad)} />
                  {errors.ciudad && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.ciudad}</p>}
                </div>

                {/* SELECTOR DE MODALIDAD */}
                <div className="md:col-span-2 space-y-3 pt-2">
                  <p className="text-[10px] tracking-widest uppercase font-bold text-on-surface">¿Cómo lo querés recibir?</p>

                  {isQuoting && (
                    <p className="text-[11px] text-on-surface/50 italic">Calculando envío con Andreani...</p>
                  )}

                  {quoteError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-4 text-[11px] text-amber-800">
                      {quoteError}{' '}
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                        Consultanos por WhatsApp
                      </a>.
                    </div>
                  )}

                  {!cotizaciones && !isQuoting && !quoteError && (
                    <p className="text-[11px] text-on-surface/50 italic">
                      Ingresá tu código postal para ver las opciones de envío.
                    </p>
                  )}

                  {cotizaciones && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(['domicilio', 'sucursal'] as TipoEnvio[]).map((tipo) => {
                        const tarifa = tarifaDe(tipo)
                        const disponible = tarifa !== null && (tipo === 'domicilio' || sucursales.length > 0)
                        const activo = tipoEnvio === tipo

                        return (
                          <button
                            key={tipo}
                            type="button"
                            disabled={!disponible}
                            onClick={() => setTipoEnvio(tipo)}
                            className={`text-left p-4 rounded-[6px] border transition-all
                              ${activo ? 'border-primary bg-primary/5' : 'border-on-surface/15 bg-white hover:border-on-surface/30'}
                              ${!disponible ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface">
                              {tipo === 'domicilio' ? '🏠 A domicilio' : '📦 Retiro en sucursal'}
                            </span>
                            <span className="block text-lg font-serif italic mt-1 text-on-surface">
                              {tarifa !== null ? `$ ${tarifa.toLocaleString('es-AR')}` : 'No disponible'}
                            </span>
                            {tipo === 'sucursal' && tarifa !== null && sucursales.length === 0 && (
                              <span className="block text-[10px] text-on-surface/50 mt-1">
                                Sin sucursales para este CP
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* DIRECCIÓN — sólo para envío a domicilio */}
                {tipoEnvio === 'domicilio' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Calle</label>
                      <input name="calle" value={formData.calle} onChange={handleInputChange}
                        data-error={!!errors.calle} className={inputClass(!!errors.calle)} placeholder="Av. Colón" />
                      {errors.calle && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.calle}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Altura</label>
                      <input name="numero" value={formData.numero} onChange={handleInputChange}
                        data-error={!!errors.numero} className={inputClass(!!errors.numero)} placeholder="1460" />
                      {errors.numero && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.numero}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Piso <span className="opacity-40">(opcional)</span></label>
                      <input name="piso" value={formData.piso} onChange={handleInputChange} className={inputClass(false)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">Depto <span className="opacity-40">(opcional)</span></label>
                      <input name="departamento" value={formData.departamento} onChange={handleInputChange} className={inputClass(false)} />
                    </div>
                  </>
                )}

                {/* SUCURSALES — sólo para retiro */}
                {tipoEnvio === 'sucursal' && (
                  <div className="md:col-span-2 space-y-3" data-error={!!errors.sucursalId}>
                    <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">
                      Elegí la sucursal donde retirás
                    </label>

                    {sucursales.length === 0 ? (
                      <p className="text-[11px] text-on-surface/50 italic">
                        No encontramos sucursales para este código postal.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {sucursales.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSucursalId(String(s.id))
                              setErrors((prev) => ({ ...prev, sucursalId: '' }))
                            }}
                            className={`w-full text-left p-4 rounded-[6px] border transition-all
                              ${sucursalId === String(s.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-on-surface/15 bg-white hover:border-on-surface/30'}`}
                          >
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface">
                              {s.descripcion}
                            </span>
                            <span className="block text-[11px] text-on-surface/60 mt-0.5">
                              {[s.calle, s.numero].filter(Boolean).join(' ')} · {s.localidad}
                            </span>
                            {s.horario && (
                              <span className="block text-[10px] text-on-surface/45 mt-1">{s.horario}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {errors.sucursalId && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.sucursalId}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-on-surface">
                    Notas para la entrega <span className="opacity-40">(opcional)</span>
                  </label>
                  <textarea name="notas" value={formData.notas} onChange={handleInputChange}
                    rows={2} className={inputClass(false)} placeholder="Timbre, referencias, horarios..." />
                </div>
              </div>
            </div>
          </section>

          {/* COLUMNA DERECHA: RESUMEN Y PAGO */}
          <section className="lg:w-5/12 w-full sticky top-32">
            <div className="bg-surface-container/30 border border-outline-variant/30 p-8 rounded-[8px] space-y-8">
              <h2 className="text-xl font-serif text-on-surface border-b border-outline-variant/20 pb-4">Resumen</h2>

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

              <div className="pt-6 border-t border-outline-variant/20 space-y-3 text-xs tracking-widest uppercase">
                <div className="flex justify-between opacity-60">
                  <span>Subtotal</span>
                  <span>$ {totalPrice.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between text-primary font-bold">
                  <span>
                    Envío Andreani
                    {cotizaciones ? (tipoEnvio === 'sucursal' ? ' · Sucursal' : ' · Domicilio') : ''}
                  </span>
                  <span>
                    {isQuoting ? '···' : shippingCost !== null ? `$ ${shippingCost.toLocaleString('es-AR')}` : '---'}
                  </span>
                </div>

                {tipoEnvio === 'sucursal' && sucursalElegida && (
                  <p className="text-[10px] text-on-surface/50 normal-case tracking-normal">
                    Retirás en {sucursalElegida.descripcion}
                  </p>
                )}

                {shippingCost === null && !isQuoting && (
                  <p className="text-[10px] text-on-surface/50 normal-case tracking-normal">
                    Ingresá tu código postal para ver el costo.
                  </p>
                )}

                <div className="flex justify-between text-lg font-bold pt-4 text-on-surface border-t border-outline-variant/10">
                  <span className="font-serif italic capitalize tracking-normal">Total</span>
                  <span>$ {(totalPrice + (shippingCost || 0)).toLocaleString('es-AR')}</span>
                </div>
              </div>

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
                      Completá los datos para continuar
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleFinalizarYPay}
                    disabled={isLoading || isQuoting}
                    className="w-full bg-on-surface text-white py-5 px-6 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-on-surface/90 transition-all disabled:opacity-50"
                  >
                    {isLoading
                      ? 'Redirigiendo a Mercado Pago...'
                      : `Pagar $ ${(totalPrice + shippingCost).toLocaleString('es-AR')} →`}
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

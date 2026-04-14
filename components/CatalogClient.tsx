'use client'

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import type { Producto } from '@/types/producto'

interface Props {
  initialProductos: Producto[]
}

const CATEGORIAS = [
  { label: 'TODOS', value: 'todos' },
  { label: 'ANILLOS', value: 'anillos' },
  { label: 'AROS', value: 'aros' },
  { label: 'BRAZALETES', value: 'brazaletes' },
  { label: 'DIJES', value: 'dijes' },
]

export default function CatalogClient({ initialProductos }: Props) {
  const [filter, setFilter] = useState('todos')

  const filteredProductos = useMemo(() => {
    if (filter === 'todos') return initialProductos
    return initialProductos.filter(p => p.categoria?.toLowerCase() === filter)
  }, [filter, initialProductos])

  return (
    <>
      {/* --- FILTROS --- */}
      <div className="mb-12 lg:mb-16 -mx-6 px-6 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar flex items-center flex-nowrap lg:flex-wrap gap-3 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-6 py-2 text-[9px] tracking-[0.3em] uppercase transition-all duration-500 border shrink-0 ${
              filter === cat.value
                ? 'bg-gold text-surface-deep border-gold font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)]'
                : 'bg-transparent text-secondary border-gold/20 hover:border-gold/50'
            }`}
            style={{ fontFamily: 'var(--font-label)' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* --- GRID EDITORIAL ASIMETRICO --- */}
      {filteredProductos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 lg:gap-12 transition-all duration-700">
          {filteredProductos.map((producto, index) => {
            // Solución B: Primera fila 2 columnas grandes (3 de 6), resto 3 columnas (2 de 6)
            const isTopRow = index < 2
            const gridSpan = isTopRow ? 'md:col-span-3' : 'md:col-span-2'
            
            return (
              <div key={producto._id} className={`${gridSpan} animate-in fade-in zoom-in duration-1000`} style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard 
                  producto={producto} 
                  index={index} 
                  variant={isTopRow ? 'featured' : 'normal'}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center gap-4 border border-outline-variant/20 bg-surface-container-low glass-panel rounded-lg">
          <p className="text-on-surface-variant font-serif italic text-xl">
            La alquimia requiere tiempo...
          </p>
          <p className="text-xs uppercase tracking-widest text-outline-variant" style={{ fontFamily: 'var(--font-label)' }}>
            No hay piezas disponibles en esta categoría.
          </p>
        </div>
      )}

      {/* --- CIERRE / CTA PERSONALIZADO --- */}
      <section className="mt-32 p-12 lg:p-20 bg-surface-deep border border-gold/10 relative overflow-hidden text-center group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.03)_0%,transparent_70%)]" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-12 h-px bg-gold/50 mx-auto mb-8 transition-all duration-1000 group-hover:w-32" />
          
          <h2 className="text-3xl lg:text-4xl text-on-surface mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Buscas una pieza <span className="italic font-serif">a medida</span>?
          </h2>
          
          <p className="text-on-surface-variant font-serif text-lg leading-relaxed mb-10 text-balance">
            Cada creación de SKILGLASS puede ser habitada por tus propios colores. 
            Realizamos encargos personalizados respetando la nobleza del cristal y la técnica flameworking.
          </p>
          
          <a
            href="https://wa.me/tu-numero" 
            className="inline-flex items-center gap-4 px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-gold hover:text-surface-deep transition-all duration-700 shadow-[0_0_20px_rgba(201,168,76,0.1)] group"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Solicitar Encargo Personalizado
            <span className="group-hover:translate-x-2 transition-transform duration-500">-&gt;</span>
          </a>
          
          <div className="w-12 h-px bg-gold/50 mx-auto mt-8 transition-all duration-1000 group-hover:w-32" />
        </div>
      </section>
    </>
  )
}

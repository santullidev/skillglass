import Image from 'next/image'

import type { CartItem } from '@/lib/cart-context'

interface Props {
  item: CartItem
  onUpdateQuantity: (id: string, q: number) => void
  onRemove: (id: string) => void
}

export default function CartItemLine({ item, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 py-6 border-b border-outline-variant/20 group">
      {/* Image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-surface-container-low iridescent-edge overflow-hidden">
        <Image
          src={item.imagenUrl || '/product-necklace.png'}
          alt={item.nombre}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, 128px"
        />
      </div>

      {/* Info */}
      <div className="grow flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg text-on-surface mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {item.nombre}
            </h3>
            <p className="label-text">{item.referencia}</p>
          </div>
          <p className="price-text text-lg whitespace-nowrap">
            $ {(item.precio * item.cantidad).toLocaleString('es-AR')} ARS
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-outline-variant/30 text-on-surface">
            <button
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
              className="px-3 py-1 hover:bg-surface-container-high transition-colors"
              aria-label="Disminuir cantidad"
            >
              —
            </button>
            <span className="px-3 py-1 text-sm font-medium" style={{ fontFamily: 'var(--font-label)' }}>
              {item.cantidad.toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
              className="px-3 py-1 hover:bg-surface-container-high transition-colors"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="text-outline-variant hover:text-error transition-colors p-2"
            aria-label="Eliminar producto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

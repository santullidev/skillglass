'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  nombre: string
  slug: string
  precio: number
  cantidad: number
  imagenUrl: string
  referencia: string // e.g. "SKG-4411 // Colección Elementos" (simulated or real from Sanity)
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, cantidad: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('skilglass-cart')
      if (storedCart) {
        setItems(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error('Failed to load cart from local storage:', error)
    }
    setIsMounted(true)
  }, [])

  // Sync to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('skilglass-cart', JSON.stringify(items))
    }
  }, [items, isMounted])

  const addItem = (newItem: Omit<CartItem, 'cantidad'>) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex((item) => item.id === newItem.id)
      
      if (existingItemIndex > -1) {
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].cantidad += 1
        return updatedItems
      }
      
      return [...currentItems, { ...newItem, cantidad: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad < 1) return
    
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.cantidad, 0)
  const totalPrice = items.reduce((total, item) => total + item.precio * item.cantidad, 0)

  // Avoid SSR mismatch by providing a placeholder context until mounted
  if (!isMounted) {
    return (
      <CartContext.Provider
        value={{
          items: [],
          addItem: () => {},
          removeItem: () => {},
          updateQuantity: () => {},
          clearCart: () => {},
          totalItems: 0,
          totalPrice: 0,
        }}
      >
        {children}
      </CartContext.Provider>
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

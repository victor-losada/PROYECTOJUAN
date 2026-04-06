'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Producto, CartItem } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  addItem: (producto: Producto, cantidad?: number) => void
  removeItem: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((producto: Producto, cantidad = 1) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.producto.id === producto.id)
      if (existingItem) {
        return current.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }
      return [...current, { producto, cantidad }]
    })
  }, [])

  const removeItem = useCallback((productoId: string) => {
    setItems((current) => current.filter((item) => item.producto.id !== productoId))
  }, [])

  const updateQuantity = useCallback((productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId)
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.producto.precio * item.cantidad, 0)
  }, [items])

  const getTotal = useCallback(() => {
    return getSubtotal()
  }, [getSubtotal])

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.cantidad, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getSubtotal,
        getItemCount,
        isOpen,
        setIsOpen,
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

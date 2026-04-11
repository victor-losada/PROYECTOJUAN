'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Producto, CartItem } from '@/lib/types'
import { getCartItemLineTotal } from '@/lib/cart-line'
import { getMuestrasList } from '@/lib/muestras'

export type AddItemOptions = {
  cantidad?: number
  esMuestra?: boolean
  muestraId?: number
}

function lineMatches(
  item: CartItem,
  productoId: string,
  esMuestra: boolean,
  muestraId?: number,
): boolean {
  if (item.producto.id !== productoId || item.esMuestra !== esMuestra) {
    return false
  }
  if (esMuestra) {
    return item.muestraId === muestraId
  }
  return true
}

interface CartContextType {
  items: CartItem[]
  addItem: (producto: Producto, options?: AddItemOptions) => void
  removeItem: (
    productoId: string,
    esMuestra: boolean,
    muestraId?: number,
  ) => void
  updateQuantity: (
    productoId: string,
    esMuestra: boolean,
    cantidad: number,
    muestraId?: number,
  ) => void
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

  const addItem = useCallback((producto: Producto, options?: AddItemOptions) => {
    const cantidad = options?.cantidad ?? 1
    const esMuestra = options?.esMuestra ?? false
    const muestraId = options?.muestraId

    if (esMuestra) {
      if (muestraId == null || !getMuestrasList(producto).some((m) => Number(m.id) === muestraId)) {
        return
      }
    }

    setItems((current) => {
      const hasFull = current.some(
        (i) => i.producto.id === producto.id && !i.esMuestra,
      )
      const hasSample = current.some(
        (i) => i.producto.id === producto.id && i.esMuestra,
      )

      if (esMuestra && hasFull) {
        return current
      }
      if (!esMuestra && hasSample) {
        return current
      }

      const existingItem = current.find((item) =>
        lineMatches(item, producto.id, esMuestra, muestraId),
      )
      if (existingItem) {
        return current.map((item) =>
          lineMatches(item, producto.id, esMuestra, muestraId)
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item,
        )
      }
      const newItem: CartItem = {
        producto,
        cantidad,
        esMuestra,
        ...(esMuestra && muestraId != null ? { muestraId } : {}),
      }
      return [...current, newItem]
    })
  }, [])

  const removeItem = useCallback(
    (productoId: string, esMuestra: boolean, muestraId?: number) => {
      setItems((current) =>
        current.filter(
          (item) => !lineMatches(item, productoId, esMuestra, muestraId),
        ),
      )
    },
    [],
  )

  const updateQuantity = useCallback(
    (
      productoId: string,
      esMuestra: boolean,
      cantidad: number,
      muestraId?: number,
    ) => {
      if (cantidad <= 0) {
        removeItem(productoId, esMuestra, muestraId)
        return
      }
      setItems((current) =>
        current.map((item) =>
          lineMatches(item, productoId, esMuestra, muestraId)
            ? { ...item, cantidad }
            : item,
        ),
      )
    },
    [removeItem],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + getCartItemLineTotal(item), 0)
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

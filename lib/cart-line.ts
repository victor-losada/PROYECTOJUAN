import type { CartItem, Producto } from '@/lib/types'
import { getMuestrasList } from '@/lib/muestras'

export function canAddCartLine(
  items: CartItem[],
  producto: Producto,
  esMuestra: boolean,
  muestraId?: number,
): { ok: true } | { ok: false; message: string } {
  const lista = getMuestrasList(producto)
  if (esMuestra) {
    if (lista.length === 0) {
      return {
        ok: false,
        message: 'Este producto no tiene muestras disponibles.',
      }
    }
    if (muestraId != null) {
      const existe = lista.some((m) => Number(m.id) === muestraId)
      if (!existe) {
        return { ok: false, message: 'Muestra no válida para este producto.' }
      }
    }
  }
  const hasFull = items.some(
    (i) => i.producto.id === producto.id && !i.esMuestra,
  )
  const hasSample = items.some(
    (i) => i.producto.id === producto.id && i.esMuestra,
  )
  if (esMuestra && hasFull) {
    return {
      ok: false,
      message:
        'Ya tienes la bolsa completa de este café en el carrito. Quítala para añadir una muestra.',
    }
  }
  if (!esMuestra && hasSample) {
    return {
      ok: false,
      message:
        'Ya tienes una muestra de este café en el carrito. Quítala para añadir la bolsa completa.',
    }
  }
  return { ok: true }
}

export function cartItemKey(item: CartItem): string {
  if (item.esMuestra && item.muestraId != null) {
    return `${item.producto.id}:m${item.muestraId}`
  }
  return `${item.producto.id}:f`
}

function findMuestra(producto: Producto, muestraId: number) {
  return getMuestrasList(producto).find((m) => Number(m.id) === muestraId)
}

export function getCartItemUnitPrice(item: CartItem): number {
  if (item.esMuestra && item.muestraId != null) {
    const m = findMuestra(item.producto, item.muestraId)
    if (m) return Number(m.precio)
  }
  return Number(item.producto.precio)
}

export function getCartItemLineTotal(item: CartItem): number {
  return getCartItemUnitPrice(item) * item.cantidad
}

export function orderItemNombreProducto(item: CartItem): string {
  if (item.esMuestra && item.muestraId != null) {
    const m = findMuestra(item.producto, item.muestraId)
    if (m) {
      return `Muestra (${m.cantidad} g) — ${item.producto.nombre}`
    }
  }
  return item.producto.nombre
}

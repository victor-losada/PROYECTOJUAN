import type { Muestra, Producto } from '@/lib/types'

/** Lista de muestras del producto (Supabase devuelve array por FK inversa). */
export function getMuestrasList(producto: Producto): Muestra[] {
  const raw = producto.muestras
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return [raw as unknown as Muestra]
}

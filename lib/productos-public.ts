import { createClient } from '@/lib/supabase/server'
import type { Producto } from '@/lib/types'

export async function getProductoPublico(id: string): Promise<Producto | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*, muestras ( id, cantidad, precio, created_at )')
    .eq('id', id)
    .eq('activo', true)
    .maybeSingle()

  if (error || !data) return null
  return data as Producto
}

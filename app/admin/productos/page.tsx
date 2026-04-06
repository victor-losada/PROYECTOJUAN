import { createClient } from '@/lib/supabase/server'
import { ProductsManager } from '@/components/admin/products-manager'

async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export default async function AdminProductosPage() {
  const productos = await getProducts()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Productos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona el catalogo de productos
        </p>
      </div>

      <ProductsManager productos={productos} />
    </div>
  )
}

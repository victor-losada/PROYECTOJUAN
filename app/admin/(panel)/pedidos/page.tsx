import { createClient } from '@/lib/supabase/server'
import { OrdersTable } from '@/components/admin/orders-table'

async function getOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      pedido_items (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

export default async function AdminPedidosPage() {
  const pedidos = await getOrders()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona todos los pedidos de la tienda
        </p>
      </div>

      <OrdersTable pedidos={pedidos} />
    </div>
  )
}

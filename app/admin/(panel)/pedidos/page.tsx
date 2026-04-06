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
    <div className="p-6 lg:p-8 space-y-6 bg-stone-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Pedidos</h1>
        <p className="text-stone-500 mt-1">
          Gestiona todos los pedidos de la tienda
        </p>
      </div>

      <OrdersTable pedidos={pedidos} />
    </div>
  )
}

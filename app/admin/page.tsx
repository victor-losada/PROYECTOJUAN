import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Package, MessageSquare, TrendingUp } from 'lucide-react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

async function getMetrics() {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // Get today's sales
  const { data: todaySales } = await supabase
    .from('pedidos')
    .select('total')
    .gte('created_at', today.toISOString())
    .not('wompi_status', 'in', '("DECLINED","VOIDED","ERROR")')

  // Get monthly sales
  const { data: monthlySales } = await supabase
    .from('pedidos')
    .select('total')
    .gte('created_at', firstDayOfMonth.toISOString())
    .not('wompi_status', 'in', '("DECLINED","VOIDED","ERROR")')

  // Get pending orders count
  const { count: pendingOrders } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')

  // Get pending reviews count
  const { count: pendingReviews } = await supabase
    .from('resenas')
    .select('*', { count: 'exact', head: true })
    .eq('aprobada', false)

  // Get total products
  const { count: totalProducts } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true)

  const todayTotal = todaySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
  const monthlyTotal = monthlySales?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

  return {
    todaySales: todayTotal,
    monthlySales: monthlyTotal,
    pendingOrders: pendingOrders || 0,
    pendingReviews: pendingReviews || 0,
    totalProducts: totalProducts || 0,
    todayOrdersCount: todaySales?.length || 0,
  }
}

async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

export default async function AdminDashboard() {
  const metrics = await getMetrics()
  const recentOrders = await getRecentOrders()

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Resumen</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de tu negocio
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas Hoy
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">
              {formatPrice(metrics.todaySales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.todayOrdersCount} pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas del Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">
              {formatPrice(metrics.monthlySales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Pendientes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">
              {metrics.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren atencion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resenas Pendientes
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">
              {metrics.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por aprobar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay pedidos recientes
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Codigo
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">{order.codigo}</td>
                      <td className="py-3 px-2">{order.nombre_cliente}</td>
                      <td className="py-3 px-2">{formatPrice(order.total)}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                          {order.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

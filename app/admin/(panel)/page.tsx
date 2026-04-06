import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Package, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ESTADOS_PEDIDO } from '@/lib/types'

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

  const { data: todaySales } = await supabase
    .from('pedidos')
    .select('total')
    .gte('created_at', today.toISOString())
    .not('wompi_status', 'in', '("DECLINED","VOIDED","ERROR")')

  const { data: monthlySales } = await supabase
    .from('pedidos')
    .select('total')
    .gte('created_at', firstDayOfMonth.toISOString())
    .not('wompi_status', 'in', '("DECLINED","VOIDED","ERROR")')

  const { count: pendingOrders } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')

  const { count: pendingReviews } = await supabase
    .from('resenas')
    .select('*', { count: 'exact', head: true })
    .eq('aprobada', false)

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
    <div className="p-6 lg:p-8 space-y-8 bg-stone-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Resumen</h1>
        <p className="text-stone-500 mt-1">
          Vista general de tu negocio
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Ventas Hoy
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">
              {formatPrice(metrics.todaySales)}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {metrics.todayOrdersCount} pedidos hoy
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Ventas del Mes
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">
              {formatPrice(metrics.monthlySales)}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Pedidos Pendientes
            </CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">
              {metrics.pendingOrders}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Requieren atencion
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Resenas Pendientes
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">
              {metrics.pendingReviews}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Por aprobar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-stone-800">Pedidos Recientes</CardTitle>
          <Link 
            href="/admin/pedidos" 
            className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-stone-500 text-center py-8">
              No hay pedidos recientes
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-stone-500">
                      Codigo
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-stone-500">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-stone-500">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-stone-500">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const estadoInfo = ESTADOS_PEDIDO[order.estado as keyof typeof ESTADOS_PEDIDO]
                    return (
                      <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="py-3 px-2 font-medium text-stone-800">{order.codigo}</td>
                        <td className="py-3 px-2 text-stone-600">{order.nombre_cliente}</td>
                        <td className="py-3 px-2 text-stone-800 font-medium">{formatPrice(order.total)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo?.color || 'bg-stone-100 text-stone-600'}`}>
                            {estadoInfo?.label || order.estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

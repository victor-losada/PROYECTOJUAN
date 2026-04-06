'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Package,
  ChefHat,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { ESTADOS_PEDIDO, type PedidoConItems, type EstadoPedido } from '@/lib/types'
import { cn } from '@/lib/utils'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

const TRACKING_STEPS: { estado: EstadoPedido; icon: typeof Package; label: string }[] = [
  { estado: 'pendiente', icon: Package, label: 'Pedido Recibido' },
  { estado: 'en_preparacion', icon: ChefHat, label: 'En Preparacion' },
  { estado: 'en_camino', icon: Truck, label: 'En Camino' },
  { estado: 'entregado', icon: CheckCircle, label: 'Entregado' },
]

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialCodigo = searchParams.get('codigo') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialCodigo)
  const [pedido, setPedido] = useState<PedidoConItems | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (initialCodigo) {
      handleSearch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCodigo])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingresa un codigo de pedido o numero de telefono')
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(searchQuery.trim())}`)
      if (!response.ok) {
        setPedido(null)
        toast.error('Pedido no encontrado')
        return
      }
      const data = await response.json()
      setPedido(data.pedido)
    } catch {
      setPedido(null)
      toast.error('Error al buscar el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReceipt = () => {
    if (pedido) {
      window.open(`/api/orders/${pedido.codigo}/receipt`, '_blank')
    }
  }

  const getCurrentStep = (estado: EstadoPedido): number => {
    if (estado === 'cancelado') return -1
    return TRACKING_STEPS.findIndex((step) => step.estado === estado)
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-display text-3xl font-bold">Seguimiento de Pedido</h1>
          <p className="text-muted-foreground">
            Ingresa tu codigo de pedido o numero de telefono para ver el estado de tu compra
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Codigo de pedido (PED-2026-XXXX) o telefono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Buscar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && !isLoading && (
          <>
            {pedido ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="font-display">
                      Pedido {pedido.codigo}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          ESTADOS_PEDIDO[pedido.estado].color
                        )}
                      >
                        {ESTADOS_PEDIDO[pedido.estado].label}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadReceipt}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Factura
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tracking Timeline */}
                  {pedido.estado !== 'cancelado' ? (
                    <div className="relative">
                      <div className="flex justify-between">
                        {TRACKING_STEPS.map((step, index) => {
                          const currentStep = getCurrentStep(pedido.estado)
                          const isCompleted = index <= currentStep
                          const isCurrent = index === currentStep
                          const Icon = step.icon

                          return (
                            <div
                              key={step.estado}
                              className="flex flex-col items-center relative z-10"
                            >
                              <div
                                className={cn(
                                  'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors',
                                  isCompleted
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'bg-background border-border text-muted-foreground'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={cn(
                                  'text-xs mt-2 text-center max-w-[80px]',
                                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                                )}
                              >
                                {step.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      {/* Progress line */}
                      <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-10">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(getCurrentStep(pedido.estado) / (TRACKING_STEPS.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 py-6 text-destructive">
                      <XCircle className="h-8 w-8" />
                      <span className="font-medium">Pedido Cancelado</span>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{pedido.nombre_cliente}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefono</p>
                      <p className="font-medium">{pedido.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entrega</p>
                      <p className="font-medium">
                        {pedido.tipo_entrega === 'domicilio' ? 'A domicilio' : 'Recoger en tienda'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-medium">{formatDate(pedido.created_at)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {pedido.items && pedido.items.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Productos</h4>
                      <div className="space-y-2">
                        {pedido.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.nombre_producto} x{item.cantidad}
                            </span>
                            <span>{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold mt-4 pt-4 border-t">
                        <span>Total</span>
                        <span className="font-display text-lg">
                          {formatPrice(pedido.total)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Pedido no encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verifica que el codigo o telefono sea correcto
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SeguimientoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <TrackingContent />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

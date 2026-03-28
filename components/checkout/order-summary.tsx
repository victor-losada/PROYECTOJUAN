'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/components/cart/cart-provider'
import { Shield, Truck } from 'lucide-react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function OrderSummary() {
  const { items, getTotal } = useCart()

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.producto.id} className="flex gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-secondary shrink-0">
                  <img
                    src={item.producto.imagen_url || '/images/placeholder-coffee.jpg'}
                    alt={item.producto.nombre}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {item.producto.nombre}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.cantidad}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-sm">
                    {formatPrice(item.producto.precio * item.cantidad)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envio</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="font-display text-xl">{formatPrice(getTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security badges */}
      <Card className="bg-secondary/30 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Pago Seguro</p>
              <p className="text-xs text-muted-foreground">
                Tu informacion de pago esta protegida con encriptacion SSL.
                Procesado por Wompi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Envio Gratis</p>
              <p className="text-xs text-muted-foreground">
                En todos los pedidos. Entrega en 2-5 dias habiles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

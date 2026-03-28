'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/components/cart/cart-provider'
import { toast } from 'sonner'
import { Truck, Store, CreditCard, Loader2 } from 'lucide-react'

interface FormData {
  nombre: string
  telefono: string
  email: string
  tipoEntrega: 'domicilio' | 'recoger'
  direccion: string
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    email: '',
    tipoEntrega: 'domicilio',
    direccion: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.nombre || !formData.telefono || !formData.email) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    if (formData.tipoEntrega === 'domicilio' && !formData.direccion) {
      toast.error('Por favor ingresa tu direccion de entrega')
      return
    }

    setIsLoading(true)

    try {
      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            producto_id: item.producto.id,
            nombre_producto: item.producto.nombre,
            precio_unitario: item.producto.precio,
            cantidad: item.cantidad,
            subtotal: item.producto.precio * item.cantidad,
          })),
          subtotal: getTotal(),
          total: getTotal(),
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el pedido')
      }

      const { pedido } = await response.json()

      // Initialize Wompi payment
      const wompiResponse = await fetch('/api/wompi/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.id,
          pedidoCodigo: pedido.codigo,
          total: getTotal(),
          email: formData.email,
          nombre: formData.nombre,
          telefono: formData.telefono,
        }),
      })

      if (!wompiResponse.ok) {
        throw new Error('Error al iniciar el pago')
      }

      const { redirectUrl } = await wompiResponse.json()
      
      // Clear cart and redirect to Wompi
      clearCart()
      window.location.href = redirectUrl

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Hubo un error al procesar tu pedido. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Informacion de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Juan Perez"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono *</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="300 123 4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="juan@ejemplo.com"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Method */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Metodo de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.tipoEntrega}
            onValueChange={(value: 'domicilio' | 'recoger') =>
              setFormData((prev) => ({ ...prev, tipoEntrega: value }))
            }
          >
            <div className="flex items-center space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
              <RadioGroupItem value="domicilio" id="domicilio" />
              <Label htmlFor="domicilio" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Envio a Domicilio</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe tu pedido en la puerta de tu casa
                    </p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
              <RadioGroupItem value="recoger" id="recoger" />
              <Label htmlFor="recoger" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Recoger en Tienda</p>
                    <p className="text-sm text-muted-foreground">
                      Calle 10 #5-23, Centro Historico, Bogota
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {formData.tipoEntrega === 'domicilio' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="direccion">Direccion de Entrega *</Label>
              <Textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Calle, numero, barrio, ciudad..."
                rows={3}
                required={formData.tipoEntrega === 'domicilio'}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pagar con Wompi
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Al continuar, aceptas nuestros terminos y condiciones de venta.
        Tu pago sera procesado de forma segura por Wompi.
      </p>
    </form>
  )
}

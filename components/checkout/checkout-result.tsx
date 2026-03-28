'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Download, Home, Search } from 'lucide-react'
import type { PedidoConItems } from '@/lib/types'

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

export function CheckoutResult() {
  const searchParams = useSearchParams()
  const pedidoCodigo = searchParams.get('pedido')
  const [pedido, setPedido] = useState<PedidoConItems | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      if (!pedidoCodigo) {
        setError('No se encontro el codigo del pedido')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/${pedidoCodigo}`)
        if (!response.ok) {
          throw new Error('Pedido no encontrado')
        }
        const data = await response.json()
        setPedido(data.pedido)
      } catch {
        setError('No se pudo cargar la informacion del pedido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [pedidoCodigo])

  const handleDownloadPDF = async () => {
    if (!pedido) return

    try {
      const response = await fetch(`/api/orders/${pedido.codigo}/receipt`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${pedido.codigo}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading receipt:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Verificando pago...</p>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">{error || 'Pedido no encontrado'}</p>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isApproved = pedido.wompi_status === 'APPROVED' || !pedido.wompi_status

  return (
    <Card className="max-w-lg w-full mx-4">
      <CardContent className="pt-6 space-y-6">
        {/* Status Icon */}
        <div className="text-center space-y-4">
          {isApproved ? (
            <div className="h-20 w-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <div className="h-20 w-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold">
              {isApproved ? 'Pago Exitoso' : 'Pago Pendiente'}
            </h1>
            <p className="text-muted-foreground">
              {isApproved
                ? 'Tu pedido ha sido recibido correctamente'
                : 'Estamos verificando tu pago'}
            </p>
          </div>
        </div>

        {/* Order Code */}
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Codigo de Pedido</p>
          <p className="font-display text-2xl font-bold text-primary">{pedido.codigo}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Guarda este codigo para hacer seguimiento
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          <h3 className="font-medium">Detalles del Pedido</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span>{pedido.nombre_cliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{pedido.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefono</span>
              <span>{pedido.telefono}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span>{pedido.tipo_entrega === 'domicilio' ? 'A domicilio' : 'Recoger en tienda'}</span>
            </div>
            {pedido.direccion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direccion</span>
                <span className="text-right max-w-[60%]">{pedido.direccion}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span>{formatDate(pedido.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        {pedido.items && pedido.items.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Productos</h3>
            <div className="space-y-2">
              {pedido.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.nombre_producto} x{item.cantidad}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-display text-xl">{formatPrice(pedido.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Descargar Recibo PDF
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/seguimiento?codigo=${pedido.codigo}`}>
              <Search className="mr-2 h-4 w-4" />
              Ver Seguimiento
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

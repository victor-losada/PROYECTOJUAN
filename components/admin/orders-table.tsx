'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Eye, 
  MessageCircle, 
  Loader2, 
  Download, 
  Mail,
  Star,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { ESTADOS_PEDIDO, type PedidoConItems, type EstadoPedido } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OrdersTableProps {
  pedidos: PedidoConItems[]
}

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
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function OrdersTable({ pedidos }: OrdersTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<PedidoConItems | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch =
      pedido.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pedido.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pedido.telefono.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || pedido.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (pedidoId: string, newStatus: EstadoPedido, sendEmail: boolean = true) => {
    setIsUpdating(pedidoId)
    try {
      const response = await fetch(`/api/admin/orders/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus, sendEmail }),
      })

      if (!response.ok) throw new Error('Error updating status')

      toast.success(sendEmail ? 'Estado actualizado y email enviado' : 'Estado actualizado')
      router.refresh()
    } catch {
      toast.error('Error al actualizar el estado')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleSendWhatsApp = (pedido: PedidoConItems) => {
    const items = pedido.pedido_items || []
    const itemsList = items
      .map((item) => `- ${item.nombre_producto} x${item.cantidad}: ${formatPrice(item.subtotal)}`)
      .join('\n')

    const trackingUrl = `${window.location.origin}/seguimiento?codigo=${pedido.codigo}`
    const estadoLabel = ESTADOS_PEDIDO[pedido.estado].label
    
    const message = `Hola ${pedido.nombre_cliente}!

Tu pedido *${pedido.codigo}* de CoffeJuancho ha sido actualizado:

*Estado actual: ${estadoLabel}*

${itemsList}

*Total: ${formatPrice(pedido.total)}*

${pedido.tipo_entrega === 'domicilio' ? `Direccion de entrega: ${pedido.direccion}` : 'Modalidad: Recoger en tienda'}

Puedes hacer seguimiento aqui: ${trackingUrl}

Gracias por tu compra!`

    const whatsappUrl = `https://wa.me/57${pedido.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDownloadReceipt = (codigo: string) => {
    window.open(`/api/orders/${codigo}/receipt`, '_blank')
  }

  const getReviewLink = (codigo: string) => {
    return `${window.location.origin}/resena/${codigo}`
  }

  const copyReviewLink = async (codigo: string) => {
    const link = getReviewLink(codigo)
    await navigator.clipboard.writeText(link)
    setCopiedLink(codigo)
    toast.success('Link de resena copiado')
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const sendReviewWhatsApp = (pedido: PedidoConItems) => {
    const reviewLink = getReviewLink(pedido.codigo)
    
    const message = `Hola ${pedido.nombre_cliente}!

Esperamos que estes disfrutando tu cafe de CoffeJuancho.

Nos encantaria saber tu opinion! Puedes dejarnos una resena aqui:
${reviewLink}

Tu feedback nos ayuda a seguir mejorando.

Gracias!`

    const whatsappUrl = `https://wa.me/57${pedido.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por codigo, cliente o telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(ESTADOS_PEDIDO).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPedidos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron pedidos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-sm font-medium">Codigo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Fecha</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{pedido.codigo}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{pedido.nombre_cliente}</p>
                          <p className="text-xs text-muted-foreground">{pedido.telefono}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{pedido.email}</td>
                      <td className="py-3 px-4">{formatPrice(pedido.total)}</td>
                      <td className="py-3 px-4">
                        <Select
                          value={pedido.estado}
                          onValueChange={(value) =>
                            handleStatusChange(pedido.id, value as EstadoPedido)
                          }
                          disabled={isUpdating === pedido.id}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-[140px] h-8 text-xs',
                              ESTADOS_PEDIDO[pedido.estado].color
                            )}
                          >
                            {isUpdating === pedido.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ESTADOS_PEDIDO).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(pedido.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(pedido)}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadReceipt(pedido.codigo)}
                            title="Descargar factura"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendWhatsApp(pedido)}
                            title="Notificar por WhatsApp"
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Pedido {selectedOrder?.codigo}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.nombre_cliente}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefono</p>
                  <p className="font-medium">{selectedOrder.telefono}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entrega</p>
                  <p className="font-medium">
                    {selectedOrder.tipo_entrega === 'domicilio' ? 'Domicilio' : 'Recoger en tienda'}
                  </p>
                </div>
                {selectedOrder.direccion && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Direccion</p>
                    <p className="font-medium">{selectedOrder.direccion}</p>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Productos</h4>
                <div className="space-y-2">
                  {selectedOrder.pedido_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.nombre_producto} x{item.cantidad}
                      </span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Acciones</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadReceipt(selectedOrder.codigo)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Factura
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSendWhatsApp(selectedOrder)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Notificar WhatsApp
                  </Button>
                </div>

                {/* Review Link Section */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Link para resena del cliente
                  </p>
                  <div className="flex gap-2">
                    <Input 
                      value={getReviewLink(selectedOrder.codigo)} 
                      readOnly 
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyReviewLink(selectedOrder.codigo)}
                    >
                      {copiedLink === selectedOrder.codigo ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => sendReviewWhatsApp(selectedOrder)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar link de resena por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

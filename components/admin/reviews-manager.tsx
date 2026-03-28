'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Check, X, MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Resena } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ReviewsManagerProps {
  resenas: Resena[]
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function ReviewsManager({ resenas }: ReviewsManagerProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const pendingReviews = resenas.filter((r) => !r.aprobada)
  const approvedReviews = resenas.filter((r) => r.aprobada)

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    setProcessingId(reviewId)

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) throw new Error('Error processing review')

      toast.success(action === 'approve' ? 'Resena aprobada' : 'Resena rechazada')
      router.refresh()
    } catch {
      toast.error('Error al procesar la resena')
    } finally {
      setProcessingId(null)
    }
  }

  const ReviewCard = ({ resena, showActions = true }: { resena: Resena; showActions?: boolean }) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-display text-sm font-semibold text-primary">
                {resena.nombre_cliente.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{resena.nombre_cliente}</p>
              <p className="text-xs text-muted-foreground">
                Pedido: {resena.codigo_pedido}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < resena.calificacion
                    ? 'fill-accent text-accent'
                    : 'fill-muted text-muted'
                )}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {resena.comentario}
        </p>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {formatDate(resena.created_at)}
          </span>
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleAction(resena.id, 'approve')}
                disabled={processingId === resena.id}
              >
                {processingId === resena.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Aprobar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleAction(resena.id, 'reject')}
                disabled={processingId === resena.id}
              >
                {processingId === resena.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="mr-1 h-4 w-4" />
                    Rechazar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending" className="gap-2">
          Pendientes
          {pendingReviews.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {pendingReviews.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Aprobadas ({approvedReviews.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-6">
        {pendingReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">No hay resenas pendientes</p>
              <p className="text-sm text-muted-foreground mt-1">
                Las nuevas resenas apareceran aqui para moderacion
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingReviews.map((resena) => (
              <ReviewCard key={resena.id} resena={resena} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="approved" className="mt-6">
        {approvedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay resenas aprobadas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {approvedReviews.map((resena) => (
              <ReviewCard key={resena.id} resena={resena} showActions={false} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

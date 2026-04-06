'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Coffee, Star, Send, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface OrderInfo {
  codigo: string
  nombre_cliente: string
  estado: string
}

export default function ResenaPage() {
  const params = useParams()
  const router = useRouter()
  const codigo = params.codigo as string

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${codigo}`)
        if (response.ok) {
          const data = await response.json()
          // Handle the response format { pedido: { ... } }
          const pedido = data.pedido || data
          setOrderInfo({
            codigo: pedido.codigo,
            nombre_cliente: pedido.nombre_cliente,
            estado: pedido.estado,
          })
        } else {
          setError('Pedido no encontrado')
        }
      } catch {
        setError('Error al cargar la información del pedido')
      } finally {
        setLoading(false)
      }
    }

    if (codigo) {
      fetchOrder()
    }
  }, [codigo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoPedido: codigo,
          calificacion: rating,
          comentario: comentario || 'Sin comentario',
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al enviar la reseña')
      }
    } catch {
      setError('Error al enviar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Coffee className="h-12 w-12 text-[#d4a574]" />
          <p className="text-stone-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error && !orderInfo) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full text-center shadow-sm">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Pedido no encontrado</h1>
          <p className="text-stone-600 mb-6">
            No pudimos encontrar el pedido asociado a este enlace.
          </p>
          <Link href="/">
            <Button variant="outline" className="rounded-none">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full text-center shadow-sm">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Gracias por tu reseña</h1>
          <p className="text-stone-600 mb-6">
            Tu opinión nos ayuda a seguir mejorando. Apreciamos que te hayas tomado el tiempo de compartir tu experiencia.
          </p>
          <Link href="/">
            <Button className="rounded-none bg-stone-800 hover:bg-stone-700">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="bg-stone-800 text-white py-6">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <Coffee className="h-8 w-8 text-[#d4a574]" />
          <span className="text-2xl font-serif">Café Caicedo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-lg">
        <div className="bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-stone-800 mb-2">Cuéntanos tu experiencia</h1>
            <p className="text-stone-600">
              Hola {orderInfo?.nombre_cliente}, nos encantaría saber qué te pareció tu pedido.
            </p>
            <p className="text-sm text-stone-500 mt-2">
              Pedido: <span className="font-mono">{codigo}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-3">
              <Label className="text-stone-700">Calificación</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-[#d4a574] text-[#d4a574]'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-stone-600">
                  {rating === 1 && 'Muy malo'}
                  {rating === 2 && 'Malo'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bueno'}
                  {rating === 5 && 'Excelente'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <Label htmlFor="comentario" className="text-stone-700">
                Comentario (opcional)
              </Label>
              <Textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Cuéntanos más sobre tu experiencia con nuestro café..."
                rows={4}
                className="rounded-none resize-none"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full rounded-none bg-stone-800 hover:bg-stone-700 h-12"
            >
              {submitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Reseña
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-stone-500 text-sm mt-6">
          Tu reseña será revisada antes de ser publicada.
        </p>
      </main>
    </div>
  )
}

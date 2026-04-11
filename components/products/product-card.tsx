'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import type { Producto } from '@/lib/types'
import { canAddCartLine } from '@/lib/cart-line'
import { getMuestrasList } from '@/lib/muestras'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  producto: Producto
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function ProductCard({ producto }: ProductCardProps) {
  const { addItem, setIsOpen, items } = useCart()
  const muestras = getMuestrasList(producto)

  const handleAddToCart = () => {
    const check = canAddCartLine(items, producto, false)
    if (!check.ok) {
      toast.error(check.message)
      return
    }
    addItem(producto, { esMuestra: false })
    toast.success(`${producto.nombre} agregado al carrito`)
    setIsOpen(true)
  }

  const handleAddMuestra = (muestraId: number) => {
    const check = canAddCartLine(items, producto, true, muestraId)
    if (!check.ok) {
      toast.error(check.message)
      return
    }
    addItem(producto, { esMuestra: true, muestraId })
    const m = muestras.find((x) => Number(x.id) === muestraId)
    toast.success(
      m
        ? `Muestra ${m.cantidad} g añadida al carrito`
        : 'Muestra añadida al carrito',
    )
    setIsOpen(true)
  }

  const isOutOfStock = producto.stock <= 0
  const isNotAvailable = producto.disponible === false
  const canPurchase = !isOutOfStock && !isNotAvailable

  const detailHref = `/producto/${producto.id}`

  return (
    <div className="group">
      <div className="relative mb-4">
        <Link href={detailHref} className="block">
          <div className="relative aspect-square overflow-hidden bg-stone-100">
            <img
              src={producto.imagen_url || '/images/placeholder-coffee.jpg'}
              alt={producto.nombre}
              className={cn(
                'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
                !canPurchase && 'grayscale',
              )}
            />
            {producto.categoria === 'ofertas' && canPurchase && (
              <span className="absolute left-3 top-3 bg-stone-800 px-3 py-1 text-xs tracking-wider text-white">
                OFERTA
              </span>
            )}
            {isNotAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <span className="bg-red-700 px-4 py-2 text-xs tracking-wider text-white">
                  NO DISPONIBLE
                </span>
              </div>
            )}
            {isOutOfStock && !isNotAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <span className="bg-stone-800 px-4 py-2 text-xs tracking-wider text-white">
                  AGOTADO
                </span>
              </div>
            )}
          </div>
        </Link>
        {canPurchase && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 max-h-[58%] overflow-y-auto p-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
            <div className="pointer-events-auto flex flex-col gap-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleAddToCart()
                }}
                className="w-full rounded-none bg-white text-xs tracking-wider text-stone-800 hover:bg-stone-800 hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                AGREGAR AL CARRITO
              </Button>
              {muestras.map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddMuestra(Number(m.id))
                  }}
                  className="w-full rounded-none border-white/90 bg-white/95 text-[11px] leading-tight tracking-wide text-stone-800 hover:bg-stone-100"
                >
                  Muestra {m.cantidad} g — {formatPrice(Number(m.precio))}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link href={detailHref} className="block space-y-2">
        <p className="text-xs tracking-widest text-stone-400">
          {producto.categoria === 'granos' && 'GRANOS ENTEROS'}
          {producto.categoria === 'molido' && 'MOLIDO'}
          {producto.categoria === 'accesorios' && 'ACCESORIOS'}
          {producto.categoria === 'ofertas' && 'OFERTAS'}
          {producto.categoria === 'regional_huila' && 'REGIONAL HUILA'}
          {producto.categoria === 'varietales' && 'VARIETALES'}
          {producto.categoria === 'cofermentados' && 'COFERMENTADOS'}
        </p>
        <h3 className="font-serif text-lg text-stone-800 group-hover:underline group-hover:underline-offset-4">
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 text-sm text-stone-500">
          {producto.descripcion}
        </p>
        <p className="font-serif text-lg text-stone-800">
          {formatPrice(producto.precio)}
        </p>
        <span className="inline-block text-xs tracking-wider text-stone-600">
          Ver ficha completa →
        </span>
      </Link>
    </div>
  )
}

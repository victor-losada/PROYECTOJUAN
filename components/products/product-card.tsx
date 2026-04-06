'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import type { Producto } from '@/lib/types'
import { toast } from 'sonner'

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
  const { addItem, setIsOpen } = useCart()

  const handleAddToCart = () => {
    addItem(producto)
    toast.success(`${producto.nombre} agregado al carrito`)
    setIsOpen(true)
  }

  const isOutOfStock = producto.stock <= 0

  return (
    <div className="group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-100 mb-4">
        <img
          src={producto.imagen_url || '/images/placeholder-coffee.jpg'}
          alt={producto.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {producto.categoria === 'ofertas' && (
          <span className="absolute left-3 top-3 bg-stone-800 text-white px-3 py-1 text-xs tracking-wider">
            OFERTA
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="bg-stone-800 text-white px-4 py-2 text-xs tracking-wider">
              AGOTADO
            </span>
          </div>
        )}
        {/* Quick Add Button - appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-white text-stone-800 hover:bg-stone-800 hover:text-white rounded-none text-xs tracking-wider"
          >
            <Plus className="mr-2 h-4 w-4" />
            AGREGAR AL CARRITO
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <p className="text-xs tracking-widest text-stone-400">
          {producto.categoria === 'granos' && 'GRANOS ENTEROS'}
          {producto.categoria === 'molido' && 'MOLIDO'}
          {producto.categoria === 'accesorios' && 'ACCESORIOS'}
          {producto.categoria === 'ofertas' && 'OFERTAS'}
        </p>
        <h3 className="font-serif text-lg text-stone-800">
          {producto.nombre}
        </h3>
        <p className="text-sm text-stone-500 line-clamp-2">
          {producto.descripcion}
        </p>
        <p className="font-serif text-lg text-stone-800">
          {formatPrice(producto.precio)}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { CATEGORIAS, type Categoria, type Producto } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductsGridProps {
  productos: Producto[]
}

export function ProductsGrid({ productos }: ProductsGridProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos')

  const productosFiltrados = categoriaActiva === 'todos'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva)

  return (
    <section id="productos" className="py-16 lg:py-24 bg-stone-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-stone-500 mb-4">
            NUESTRA TIENDA
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl italic text-stone-800 mb-4">
            Cafe de origen unico
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Cada bolsa viene directamente de nuestra finca, tostada en pequenos lotes para garantizar frescura y calidad excepcional.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIAS.map((categoria) => (
            <Button
              key={categoria.value}
              variant="ghost"
              size="sm"
              onClick={() => setCategoriaActiva(categoria.value)}
              className={cn(
                'rounded-none border-b-2 border-transparent px-4 py-2 text-xs tracking-widest transition-all hover:bg-transparent',
                categoriaActiva === categoria.value 
                  ? 'border-stone-800 text-stone-800' 
                  : 'text-stone-500 hover:text-stone-800'
              )}
            >
              {categoria.label.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">
              No hay productos disponibles en esta categoria.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

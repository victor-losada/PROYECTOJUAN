'use client'

import { useState } from 'react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import {
  CATEGORIAS,
  SUBCATEGORIAS,
  type Categoria,
  type Producto,
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductsGridProps {
  productos: Producto[]
}

export function ProductsGrid({ productos }: ProductsGridProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos')
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string | null>(
    null,
  )

  const productosFiltrados = productos.filter((p) => {
    if (categoriaActiva === 'todos') return true

    if (subcategoriaActiva) {
      return (
        p.categoria === categoriaActiva &&
        p.subcategoria === subcategoriaActiva
      )
    }

    return p.categoria === categoriaActiva
  })

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
            Cada bolsa viene directamente de nuestra finca, tostada en pequeños
            lotes para garantizar frescura y calidad excepcional.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {CATEGORIAS.map((categoria) => (
            <Button
              key={categoria.value}
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoriaActiva(categoria.value)
                setSubcategoriaActiva(null)
              }}
              className={cn(
                'rounded-none border-b-2 border-transparent px-4 py-2 text-xs tracking-widest transition-all hover:bg-transparent',
                categoriaActiva === categoria.value
                  ? 'border-stone-800 text-stone-800'
                  : 'text-stone-500 hover:text-stone-800',
              )}
            >
              {categoria.label.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Subcategory Filters */}
        {categoriaActiva !== 'todos' && SUBCATEGORIAS[categoriaActiva] && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {SUBCATEGORIAS[categoriaActiva].map((sub) => (
              <Button
                key={sub.value}
                variant="ghost"
                size="sm"
                onClick={() => setSubcategoriaActiva(sub.value)}
                className={cn(
                  'text-xs px-3 py-1',
                  subcategoriaActiva === sub.value
                    ? 'text-stone-800 underline'
                    : 'text-stone-500 hover:text-stone-800',
                )}
              >
                {sub.label}
              </Button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

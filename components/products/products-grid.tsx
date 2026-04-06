'use client'

import { useState } from 'react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
<<<<<<< HEAD
import { CATEGORIAS, type Categoria, type Producto } from '@/lib/types'
=======
import {
  CATEGORIAS,
  SUBCATEGORIAS,
  type Categoria,
  type Producto,
} from '@/lib/types'
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
import { cn } from '@/lib/utils'

interface ProductsGridProps {
  productos: Producto[]
}

export function ProductsGrid({ productos }: ProductsGridProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos')
<<<<<<< HEAD

  const productosFiltrados = categoriaActiva === 'todos'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva)
=======
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string | null>(
    null
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
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)

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
<<<<<<< HEAD
            Cada bolsa viene directamente de nuestra finca, tostada en pequenos lotes para garantizar frescura y calidad excepcional.
=======
            Cada bolsa viene directamente de nuestra finca, tostada en pequeños
            lotes para garantizar frescura y calidad excepcional.
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
          </p>
        </div>

        {/* Category Filters */}
<<<<<<< HEAD
        <div className="flex flex-wrap justify-center gap-3 mb-12">
=======
        <div className="flex flex-wrap justify-center gap-3 mb-8">
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
          {CATEGORIAS.map((categoria) => (
            <Button
              key={categoria.value}
              variant="ghost"
              size="sm"
<<<<<<< HEAD
              onClick={() => setCategoriaActiva(categoria.value)}
              className={cn(
                'rounded-none border-b-2 border-transparent px-4 py-2 text-xs tracking-widest transition-all hover:bg-transparent',
                categoriaActiva === categoria.value 
                  ? 'border-stone-800 text-stone-800' 
=======
              onClick={() => {
                setCategoriaActiva(categoria.value)
                setSubcategoriaActiva(null) // reset subcategoría
              }}
              className={cn(
                'rounded-none border-b-2 border-transparent px-4 py-2 text-xs tracking-widest transition-all hover:bg-transparent',
                categoriaActiva === categoria.value
                  ? 'border-stone-800 text-stone-800'
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
                  : 'text-stone-500 hover:text-stone-800'
              )}
            >
              {categoria.label.toUpperCase()}
            </Button>
          ))}
        </div>

<<<<<<< HEAD
=======
        {/* Subcategory Filters */}
        {categoriaActiva !== 'todos' &&
          SUBCATEGORIAS[categoriaActiva] && (
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
                      : 'text-stone-500 hover:text-stone-800'
                  )}
                >
                  {sub.label}
                </Button>
              ))}
            </div>
          )}

>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
        {/* Products Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>

<<<<<<< HEAD
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">
              No hay productos disponibles en esta categoria.
=======
        {/* Empty State */}
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">
              No hay productos disponibles en esta categoría.
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
            </p>
          </div>
        )}
      </div>
    </section>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)

'use client'

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { SUBCATEGORIAS, CATEGORIAS, type Producto } from '@/lib/types'
import { canAddCartLine } from '@/lib/cart-line'
import { getMuestrasList } from '@/lib/muestras'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function categoriaLabel(categoria: string): string {
  const found = CATEGORIAS.find((c) => c.value === categoria)
  return found?.label ?? categoria
}

function subcategoriaLabel(categoria: string, sub: string): string {
  const subs = SUBCATEGORIAS[categoria as keyof typeof SUBCATEGORIAS]
  const item = subs?.find((s) => s.value === sub)
  return item?.label ?? sub
}

function displayFichaValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' && value.trim() === '') return '—'
  return String(value)
}

const FICHA_ITEMS: {
  label: string
  get: (p: Producto) => string | number | null | undefined
  wide?: boolean
}[] = [
  { label: 'Origen', get: (p) => p.origen },
  { label: 'Nombre de finca', get: (p) => p.nombre_finca },
  { label: 'Productor', get: (p) => p.productor },
  { label: 'Altitud', get: (p) => p.altitud },
  { label: 'Cosecha', get: (p) => p.cosecha },
  { label: 'Puntaje SCA', get: (p) => p.puntaje_sca },
  { label: 'Perfil sensorial', get: (p) => p.perfil_sensorial, wide: true },
  { label: 'Método de secado', get: (p) => p.metodo_secado },
  { label: 'Tiempo de secado', get: (p) => p.tiempo_secado },
  { label: 'Proceso', get: (p) => p.proceso },
  { label: 'Presentación', get: (p) => p.presentacion, wide: true },
]

export function ProductDetailView({ producto }: { producto: Producto }) {
  const { addItem, setIsOpen, items } = useCart()
  const isOutOfStock = producto.stock <= 0
  const isNotAvailable = producto.disponible === false
  const canPurchase = !isOutOfStock && !isNotAvailable
  const muestras = getMuestrasList(producto)
  const tieneMuestras = muestras.length > 0

  const handleAddBolsa = () => {
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
        ? `Muestra (${m.cantidad} g) de ${producto.nombre} añadida al carrito`
        : 'Muestra añadida al carrito',
    )
    setIsOpen(true)
  }

  return (
    <div className="bg-stone-50/40 py-8 md:py-12">
      <div className="mx-auto max-w-md px-4 md:max-w-2xl">
        <Link
          href="/#productos"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="relative aspect-4/3 bg-stone-100">
            <img
              src={producto.imagen_url || '/images/placeholder-coffee.jpg'}
              alt={producto.nombre}
              className={cn(
                'h-full w-full object-cover',
                !canPurchase && 'grayscale',
              )}
            />
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

          <div className="space-y-6 p-6 md:p-8">
            <div>
              <p className="text-xs tracking-[0.25em] text-stone-500">
                {categoriaLabel(producto.categoria).toUpperCase()}
                {producto.subcategoria
                  ? ` · ${subcategoriaLabel(producto.categoria, producto.subcategoria)}`
                  : ''}
              </p>
              <h1 className="mt-2 font-serif text-2xl text-stone-900 md:text-3xl">
                {producto.nombre}
              </h1>
              {producto.descripcion && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600 md:text-base">
                  {producto.descripcion}
                </p>
              )}
            </div>

            <div className="space-y-3 border-y border-stone-100 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-serif text-2xl text-stone-800">
                  {formatPrice(producto.precio)}
                </p>
                <p className="text-sm text-stone-500">
                  {producto.stock > 0
                    ? `${producto.stock} disponibles`
                    : 'Sin inventario'}
                </p>
              </div>
              {tieneMuestras && (
                <div className="flex flex-wrap gap-2">
                  {muestras.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs text-stone-700"
                    >
                      {m.cantidad} g — {formatPrice(Number(m.precio))}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <section aria-labelledby="ficha-heading">
              <h2
                id="ficha-heading"
                className="font-serif text-lg text-stone-800 md:text-xl"
              >
                Ficha técnica
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Información del lote registrada en administración.
              </p>
              <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                {FICHA_ITEMS.map(({ label, get, wide }) => {
                  const shown = displayFichaValue(get(producto))
                  const empty = shown === '—'
                  return (
                    <div
                      key={label}
                      className={cn(wide && 'sm:col-span-2')}
                    >
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                        {label}
                      </dt>
                      <dd
                        className={cn(
                          'mt-1 text-sm leading-snug md:text-[15px]',
                          empty
                            ? 'italic text-stone-400'
                            : 'text-stone-800',
                        )}
                      >
                        {shown}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </section>

            <div className="space-y-3 border-t border-stone-100 pt-6">
              {canPurchase &&
                tieneMuestras &&
                muestras.map((m) => (
                  <Button
                    key={m.id}
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-none border-stone-300 text-stone-800 hover:bg-stone-100"
                    onClick={() => handleAddMuestra(Number(m.id))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Muestra {m.cantidad} g — {formatPrice(Number(m.precio))}
                  </Button>
                ))}
              {canPurchase ? (
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full rounded-none bg-stone-800 text-white hover:bg-stone-900"
                  onClick={handleAddBolsa}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar bolsa completa
                </Button>
              ) : (
                <p className="text-center text-sm text-stone-500">
                  {isNotAvailable
                    ? 'Este producto no está disponible para la venta.'
                    : 'Producto agotado. Vuelve pronto.'}
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

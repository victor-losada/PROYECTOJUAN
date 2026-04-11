import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { ProductDetailView } from '@/components/products/product-detail-view'
import { getProductoPublico } from '@/lib/productos-public'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const producto = await getProductoPublico(id)
  if (!producto) {
    return { title: 'Producto no encontrado' }
  }
  return {
    title: `${producto.nombre} | Drip coffee`,
    description: producto.descripcion ?? `Café de origen: ${producto.nombre}`,
  }
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params
  const producto = await getProductoPublico(id)
  if (!producto) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <ProductDetailView producto={producto} />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

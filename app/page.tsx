import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/sections/hero'
import { Origin } from '@/components/sections/origin'
import { ProcessSection } from '@/components/sections/process'
import { ProductsGrid } from '@/components/products/products-grid'
import { Reviews } from '@/components/sections/reviews'
import { CartDrawer } from '@/components/cart/cart-drawer'
import type { Producto, Resena } from '@/lib/types'

async function getProductos(): Promise<Producto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*, muestras ( id, cantidad, precio, created_at )')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos:', error)
    return []
  }

  return data || []
}

async function getResenas(): Promise<Resena[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resenas')
    .select('*')
    .eq('aprobada', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching resenas:', error)
    return []
  }

  return data || []
}

export default async function HomePage() {
  const [productos, resenas] = await Promise.all([
    getProductos(),
    getResenas(),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductsGrid productos={productos} />
        <Origin />
        <ProcessSection />
        <Reviews resenas={resenas} />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

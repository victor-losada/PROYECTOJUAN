import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CheckoutResult } from '@/components/checkout/checkout-result'

export default function ResultadoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Verificando pago...</p>
          </div>
        }>
          <CheckoutResult />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

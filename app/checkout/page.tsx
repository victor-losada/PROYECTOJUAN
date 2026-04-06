'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import { useCart } from '@/components/cart/cart-provider'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, getTotal } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-24 w-24 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Tu carrito esta vacio</h1>
            <p className="text-muted-foreground">
              Agrega productos antes de continuar con el pago.
            </p>
            <Button asChild>
              <Link href="/#productos">Ver Productos</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la tienda
            </Link>
          </Button>

          <h1 className="font-display text-3xl font-bold mb-8">Finalizar Compra</h1>

          <div className="grid gap-8 lg:grid-cols-2">
            <CheckoutForm />
            <OrderSummary />
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

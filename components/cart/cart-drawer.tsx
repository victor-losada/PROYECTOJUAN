'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCart } from './cart-provider'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal, clearCart } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-serif text-stone-800">
            <ShoppingBag className="h-5 w-5" />
            Tu Carrito
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-24 w-24 rounded-full bg-stone-100 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-stone-400" />
            </div>
            <div>
              <p className="font-medium text-stone-800">Tu carrito esta vacio</p>
              <p className="text-sm text-stone-500">
                Agrega productos para comenzar tu pedido
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="rounded-none border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white"
            >
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={item.producto.imagen_url || '/images/placeholder-coffee.jpg'}
                        alt={item.producto.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-serif text-sm text-stone-800 line-clamp-1">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-sm text-stone-500">
                        {formatPrice(item.producto.precio)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-none border-stone-300"
                          onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-stone-800">
                          {item.cantidad}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-none border-stone-300"
                          onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-stone-400 hover:text-stone-800"
                          onClick={() => removeItem(item.producto.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-sm text-stone-800">
                        {formatPrice(item.producto.precio * item.cantidad)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4">
              <Separator className="bg-stone-200" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-800">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Envio</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <Separator className="bg-stone-200" />
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-800">Total</span>
                  <span className="font-serif text-lg text-stone-800">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button 
                  asChild 
                  className="w-full rounded-none bg-stone-800 hover:bg-stone-700" 
                  size="lg"
                >
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    Ir a Pagar
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-stone-300 text-stone-600 hover:bg-stone-100"
                  onClick={() => {
                    clearCart()
                    setIsOpen(false)
                  }}
                >
                  Vaciar Carrito
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

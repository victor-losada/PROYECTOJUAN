'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'INICIO' },
  { href: '/#productos', label: 'TIENDA' },
  { href: '/#origen', label: 'ORIGEN' },
  { href: '/#proceso', label: 'PROCESO' },
<<<<<<< HEAD
=======
  { href: '/#resenas', label: 'RESEÑAS' },
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
  { href: '/seguimiento', label: 'MI PEDIDO' },
]

export function Header() {
  const { getItemCount, setIsOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = getItemCount()

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-stone-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-serif text-xl tracking-wide text-stone-800">
          Drip coffee
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-widest text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="text-stone-600 hover:text-stone-900"
              aria-label="Admin"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-stone-600 hover:text-stone-900"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-xs font-medium text-white">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-stone-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-white',
          mobileMenuOpen ? 'max-h-64' : 'max-h-0'
        )}
      >
        <nav className="container mx-auto flex flex-col gap-4 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-widest text-stone-600 transition-colors hover:text-stone-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="text-xs font-medium tracking-widest text-stone-600 transition-colors hover:text-stone-900"
            onClick={() => setMobileMenuOpen(false)}
          >
            ADMIN
          </Link>
        </nav>
      </div>
    </header>
  )
}

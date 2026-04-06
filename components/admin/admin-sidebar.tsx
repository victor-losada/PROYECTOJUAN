'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Coffee,
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Resumen' },
  { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/contenido', icon: ImageIcon, label: 'Contenido' },
  { href: '/admin/resenas', icon: MessageSquare, label: 'Resenas' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesion cerrada')
    router.push('/admin/login')
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-2">
          <Coffee className="h-8 w-8 text-sidebar-primary" />
          <div>
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              CoffeJuancho
            </span>
            <p className="text-xs text-sidebar-foreground/60">Panel Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesion
        </Button>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 mt-1 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          Ver tienda
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-opacity',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 h-full w-64 bg-sidebar flex flex-col transition-transform',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <NavContent />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar flex-col border-r border-sidebar-border">
        <NavContent />
      </aside>
    </>
  )
}

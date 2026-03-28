import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/components/cart/cart-provider'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DRIP COFFEE | Cafe de Especialidad Tostado Artesanalmente',
  description: 'Descubre el mejor cafe de especialidad colombiano. Granos tostados artesanalmente, molidos frescos y accesorios premium para amantes del cafe.',
  keywords: ['cafe', 'cafe colombiano', 'cafe de especialidad', 'tostado artesanal', 'granos de cafe'],
  generator: 'victor manuel',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#5D4037',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${inter.variable} font-body antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

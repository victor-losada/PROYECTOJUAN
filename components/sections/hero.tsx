'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
<<<<<<< HEAD
          src="/images/hero-coffee.jpg"
=======
          src="/images/herocafetal.png"
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
          alt="Taza de cafe con granos"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Content Card - Frosted Glass Effect */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-background/60">
            Cafe de una sola finca
          </p>
          <h1 className="font-serif text-5xl leading-tight text-background md:text-7xl md:leading-tight">
            <span className="text-balance">
              No es solo cafe.{" "}
              <span className="italic">Es origen.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-background/70">
            De nuestra finca familiar en Huila, Colombia, a tu taza.
            Cada grano cultivado con cuidado, cada tueste con proposito.
          </p>
          
          {/* Buttons */}
          <div className="mt-10  flex flex-wrap gap-4">
            <Link href="/#productos">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Descubrir nuestro cafe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#origen">
              <Button
                size="lg"
                
                className="bg-background text-foreground hover:bg-background/90 "
              >
                Conocer la historia
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/573013101287?text=Hola%20Juan%20David%20buen%20dia,%20me%20interesa%20conocer%20mas%20sobre%20su%20cafe"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </section>
  )
}

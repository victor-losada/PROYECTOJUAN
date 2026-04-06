import Link from 'next/link'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-stone-200 bg-[#5e3417]">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl tracking-wide text-stone-800">
                Drip coffee
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              Cafe de especialidad de una sola finca. Desde las montanas de Huila, Colombia, hasta tu taza.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium tracking-widest text-stone-800 uppercase">
              Enlaces
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/#productos" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                Tienda
              </Link>
              <Link href="/#origen" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                Origen
              </Link>
              <Link href="/#origen" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                Proceso
              </Link>
              <Link href="/seguimiento" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                Mi Pedido
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium tracking-widest text-stone-800 uppercase">
              Contacto
            </h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+573001234567" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                <Phone className="h-4 w-4" />
                +57 300 123 4567
              </a>
              <a href="mailto:hola@coffejuancho.com" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                <Mail className="h-4 w-4" />
                hola@coffejuancho.com
              </a>
              <div className="flex items-start gap-2 text-sm text-stone-500">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Finca VellaVista, Huila, Colombia</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium tracking-widest text-stone-800 uppercase">
              Siguenos
            </h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/juan_guzman_coffee/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100093437017212&ref=PROFILE_EDIT_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8">
          <p className="text-center text-sm text-stone-400">
            &copy; {new Date().getFullYear()} CoffeJuancho. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import type { Resena } from '@/lib/types'

// Static testimonials to show when no reviews exist

interface ReviewsProps {
  resenas: Resena[]
}

export function Reviews({ resenas }: ReviewsProps) {
  // Use static testimonials if no real reviews exist
  const displayTestimonials = resenas.slice(0, 3)

  return (
    <section id="resenas" className="py-16 lg:py-24 bg-[#5e3417]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs tracking-[0.3em] text-stone-400 mb-4">
            TESTIMONIOS
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl italic text-white">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTestimonials.length > 0 ? (
            displayTestimonials.map((r) => (
              <div
                key={r.id}
                className="bg-[#6B5A4D] rounded-lg p-8 space-y-6"
              >
                {/* Icon */}
                <div className="text-stone-500">
                  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                  "{r.comentario}"
                </p>

                <div>
                  <p className="font-semibold text-white">
                    {r.nombre_cliente}
                  </p>
                  <p className="text-stone-400 text-sm">
                    Cliente verificado
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center">
              <p className="text-stone-300 text-center text-lg">
                No hay reseñas todavía
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

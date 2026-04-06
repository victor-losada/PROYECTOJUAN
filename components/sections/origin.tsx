'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SiteContent {
  section: string
  content_type: 'video' | 'image'
  url: string
}

export function Origin() {
  const [content, setContent] = useState<SiteContent | null>(null)

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'origin')
        .single()
      
      if (data) setContent(data)
    }
    fetchContent()
  }, [])

  return (
    <section id="origen" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Title */}
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl italic text-stone-800 mb-16 max-w-2xl leading-tight">
          Una finca, una familia, un cafe excepcional
        </h2>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image or Video */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden">
              {content?.content_type === 'video' ? (
                <video
                  src={content.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={content?.url || "/images/origenfinca.png"}
                  alt="Finca cafetera en las montanas de Huila, Colombia"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Origen familiar */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-stone-800">
                Origen familiar
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Nuestra finca se encuentra en las montanas de Huila, Colombia, a mas de 1,700 metros sobre el nivel del mar. Aqui, tres generaciones han cuidado estas tierras con la misma pasion: producir un cafe que{' '}
                <span className="italic">hable por si mismo.</span>
              </p>
            </div>

            {/* Trazabilidad total */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-stone-800">
                Trazabilidad total
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Cada bolsa que recibes viene de un solo origen, una sola finca. Sabemos exactamente de que lote proviene cada grano, como fue procesado y cuando fue tostado.{' '}
                <span className="italic">No hay intermediarios ni mezclas. Solo cafe puro de nuestra tierra.</span>
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-stone-200">
              <div>
                <p className="font-serif text-3xl md:text-4xl text-stone-700">+1,750</p>
                <p className="text-xs tracking-widest text-stone-500 mt-1">MSNM DE ALTITUD</p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-stone-700">3</p>
                <p className="text-xs tracking-widest text-stone-500 mt-1">GENERACIONES</p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-stone-700">100%</p>
                <p className="text-xs tracking-widest text-stone-500 mt-1">UNA SOLA FINCA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

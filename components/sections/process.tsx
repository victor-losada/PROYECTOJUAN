'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Sprout, Sun, Flame, Package } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SiteContent {
  section: string
  content_type: 'video' | 'image'
  url: string
}

const steps = [
  {
    icon: Sprout,
    title: "Cultivo",
    description:
      "Cultivamos bajo sombra a mas de 1,750 msnm. El clima frio y la altitud generan granos mas densos, con mayor concentracion de azucares y complejidad de sabor.",
  },
  {
    icon: Sun,
    title: "Cosecha selectiva",
    description:
      "Cada cereza se recolecta a mano en su punto optimo de maduracion. Solo seleccionamos las cerezas rojas, garantizando uniformidad y calidad desde el primer paso.",
  },
  {
    icon: Flame,
    title: "Tueste artesanal",
    description:
      "Tostamos en pequenos lotes para controlar cada segundo del proceso. Buscamos perfiles que resalten las cualidades naturales del grano, no que las enmascaren.",
  },
  {
    icon: Package,
    title: "Empaque fresco",
    description:
      "Empacamos inmediatamente despues del tueste con valvula desgasificadora. Enviamos directo a tu puerta para que recibas el cafe en su punto optimo de frescura.",
  },
]

export function ProcessSection() {
  const [content, setContent] = useState<SiteContent | null>(null)

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'process')
        .single()
      
      if (data) setContent(data)
    }
    fetchContent()
  }, [])

  return (
    <section id="proceso" className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left - Image or Video */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-md lg:sticky lg:top-24">
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
                src={content?.url || "/images/process.png"}
                alt="Proceso artesanal de tueste de cafe"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Right - Steps */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Del grano a la taza
            </p>
            <h2 className="mb-12 font-serif text-4xl leading-tight text-foreground md:text-5xl">
              <span className="text-balance">Cada paso importa</span>
            </h2>

            <div className="flex flex-col gap-10">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <step.icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="mt-2 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <h3 className="mb-2 font-serif text-xl text-foreground">{step.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

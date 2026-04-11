'use client'

import { useSiteContentSection } from '@/hooks/use-site-content-section'
import { cn } from '@/lib/utils'

interface SectionMediaProps {
  section: 'origin' | 'process'
  fallbackSrc: string
  alt: string
  className?: string
  imgClassName?: string
}

export function SectionMedia({
  section,
  fallbackSrc,
  alt,
  className,
  imgClassName,
}: SectionMediaProps) {
  const content = useSiteContentSection(section)
  const url = content?.url || fallbackSrc
  const isVideo = content?.content_type === 'video'

  return (
    <div className={cn('overflow-hidden', className)}>
      {isVideo ? (
        <video
          key={url}
          autoPlay
          muted
          loop
          playsInline
          className={cn('h-full w-full object-cover', imgClassName)}
        >
          <source src={url} />
        </video>
      ) : (
        <img
          key={url}
          src={url}
          alt={alt}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  )
}

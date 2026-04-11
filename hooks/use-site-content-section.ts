'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SiteContentRow {
  section: string
  content_type: 'video' | 'image'
  url: string
}

export function useSiteContentSection(section: string) {
  const [content, setContent] = useState<SiteContentRow | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_content')
        .select('section, content_type, url')
        .eq('section', section)
        .maybeSingle()

      if (!cancelled && data) {
        setContent(data as SiteContentRow)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [section])

  return content
}

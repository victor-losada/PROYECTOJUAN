'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Video, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface SiteContent {
  id: string
  section: string
  content_type: 'video' | 'image'
  url: string
}

const SECTIONS = [
  { 
    key: 'hero', 
    title: 'Hero (Inicio)', 
    description: 'Video o imagen de fondo en la seccion principal',
  },
  { 
    key: 'origin', 
    title: 'Origen', 
    description: 'Contenido para la seccion de origen del cafe',
  },
  { 
    key: 'process', 
    title: 'Proceso', 
    description: 'Contenido para la seccion de proceso',
  },
]

export function ContentManager() {
  const [contents, setContents] = useState<SiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/admin/site-content')
      if (response.ok) {
        const data = await response.json()
        setContents(Array.isArray(data) ? data : data.contents ?? [])
      }
    } catch (error) {
      console.error('Error fetching contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContentForSection = (section: string) => {
    return contents.find(c => c.section === section)
  }

  const handleFileUpload = async (section: string, file: File) => {
    setUploading(section)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error('Error uploading file' )

      const { url } = await uploadResponse.json()
      const contentType = file.type.startsWith('video/') ? 'video' : 'image'

      const response = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content_type: contentType, url }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(
          typeof errBody.error === 'string' ? errBody.error : 'Error saving content'
        )
      }

      toast.success('Contenido actualizado')
      fetchContents()
    } catch (error) {
      console.error('Upload error:', error)
      const message =
        error instanceof Error ? error.message : 'Error al subir el archivo'
      toast.error(message)
    } finally {
      setUploading(null)
    }
  }

  const handleInputChange = (section: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    
    if (file.size > maxSize) {
      toast.error(`Archivo muy grande. Max: ${isVideo ? '50MB' : '5MB'}`)
      return
    }
    
    handleFileUpload(section, file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {SECTIONS.map((section) => {
        const content = getContentForSection(section.key)
        const isUploading = uploading === section.key

        return (
          <Card key={section.key} className="border-stone-200 overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-medium text-stone-800">{section.title}</h3>
                <p className="text-sm text-stone-500">{section.description}</p>
              </div>

              {/* Preview */}
              <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden relative">
                {content?.url ? (
                  content.content_type === 'video' ? (
                    <video
                      src={content.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : (
                    <img
                      src={content.url}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-stone-300" />
                  </div>
                )}
                {content && (
                  <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {content.content_type === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {content.content_type === 'video' ? 'Video' : 'Imagen'}
                  </span>
                )}
              </div>

              {/* Upload */}
              <div>
                <input
                  ref={(el) => { fileInputRefs.current[section.key] = el }}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleInputChange(section.key, e)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-stone-200"
                  onClick={() => fileInputRefs.current[section.key]?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" />{content ? 'Cambiar' : 'Subir'}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

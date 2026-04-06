'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Upload, Video, ImageIcon, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { put } from '@vercel/blob'

interface SiteContent {
  id: string
  section: string
  content_type: 'video' | 'image'
  url: string
  updated_at: string
}

const SECTIONS = [
  { key: 'hero', label: 'Hero (Inicio)', description: 'Video o imagen de fondo en la seccion principal' },
  { key: 'origin', label: 'Origen', description: 'Imagen o video de la seccion de origen de la finca' },
  { key: 'process', label: 'Proceso', description: 'Imagen o video de la seccion del proceso del cafe' },
]

export function ContentManager() {
  const [contents, setContents] = useState<SiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    fetchContents()
  }, [])

  async function fetchContents() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section')

    if (error) {
      toast.error('Error al cargar contenido')
      return
    }

    setContents(data || [])
    setLoading(false)
  }

  async function handleFileUpload(section: string, file: File) {
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isVideo && !isImage) {
      toast.error('Solo se permiten imagenes o videos')
      return
    }

    setUploading(section)

    try {
      // Upload to Vercel Blob
      const blob = await put(`content/${section}-${Date.now()}.${file.name.split('.').pop()}`, file, {
        access: 'public',
      })

      // Update database
      const supabase = createClient()
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          content_type: isVideo ? 'video' : 'image',
          url: blob.url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'section'
        })

      if (error) throw error

      toast.success('Contenido actualizado correctamente')
      fetchContents()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error al subir el archivo')
    } finally {
      setUploading(null)
    }
  }

  async function handleTypeChange(section: string, contentType: 'video' | 'image') {
    const content = contents.find(c => c.section === section)
    if (!content || content.content_type === contentType) return

    const supabase = createClient()
    const { error } = await supabase
      .from('site_content')
      .update({ content_type: contentType, updated_at: new Date().toISOString() })
      .eq('section', section)

    if (error) {
      toast.error('Error al actualizar tipo')
      return
    }

    toast.success('Tipo de contenido actualizado')
    fetchContents()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contenido Multimedia</h2>
        <p className="text-muted-foreground">
          Gestiona los videos e imagenes de las secciones principales del sitio
        </p>
      </div>

      <div className="grid gap-6">
        {SECTIONS.map(section => {
          const content = contents.find(c => c.section === section.key)
          const isUploading = uploading === section.key

          return (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {content?.content_type === 'video' ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                  {section.label}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  {content?.content_type === 'video' ? (
                    <video
                      src={content.url}
                      className="h-full w-full object-cover"
                      controls
                      muted
                    />
                  ) : content?.url ? (
                    <img
                      src={content.url}
                      alt={section.label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Sin contenido
                    </div>
                  )}
                </div>

                {/* Type Selector */}
                <div className="space-y-2">
                  <Label>Tipo de contenido</Label>
                  <RadioGroup
                    value={content?.content_type || 'image'}
                    onValueChange={(value) => handleTypeChange(section.key, value as 'video' | 'image')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id={`${section.key}-image`} />
                      <Label htmlFor={`${section.key}-image`} className="cursor-pointer">
                        Imagen
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id={`${section.key}-video`} />
                      <Label htmlFor={`${section.key}-video`} className="cursor-pointer">
                        Video
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Upload Button */}
                <div>
                  <Label
                    htmlFor={`upload-${section.key}`}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span>Subir {content?.content_type === 'video' ? 'video' : 'imagen'}</span>
                        </>
                      )}
                    </div>
                  </Label>
                  <input
                    id={`upload-${section.key}`}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(section.key, file)
                    }}
                  />
                </div>

                {content?.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Ultima actualizacion: {new Date(content.updated_at).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

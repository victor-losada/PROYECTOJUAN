import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching site content:', error)
    return NextResponse.json(
      { error: 'Error al obtener el contenido' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { section, content_type, url } = body

    if (!section || !content_type || !url) {
      return NextResponse.json(
        { error: 'Campos obligatorios faltantes' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('site_content')
      .upsert(
        {
          section,
          content_type,
          url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating site content:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el contenido' },
      { status: 500 }
    )
  }
}

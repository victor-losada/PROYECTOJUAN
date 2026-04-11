import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('muestras')
      .select('id, cantidad, precio, created_at')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching muestras:', error)
      return NextResponse.json(
        { error: 'Error al listar muestras' },
        { status: 500 },
      )
    }

    return NextResponse.json({ muestras: data ?? [] })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

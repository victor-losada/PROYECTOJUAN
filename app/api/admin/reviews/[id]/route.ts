import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('resenas')
        .update({ aprobada: true })
        .eq('id', id)

      if (error) {
        console.error('Error approving review:', error)
        return NextResponse.json(
          { error: 'Error al aprobar la resena' },
          { status: 500 }
        )
      }
    } else if (action === 'reject') {
      const { error } = await supabase
        .from('resenas')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error rejecting review:', error)
        return NextResponse.json(
          { error: 'Error al rechazar la resena' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Accion no valida' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Review action error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

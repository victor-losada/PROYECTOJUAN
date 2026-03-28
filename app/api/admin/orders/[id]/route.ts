import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estado } = body

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const validStates = ['pendiente', 'en_preparacion', 'en_camino', 'entregado', 'cancelado']
    if (!validStates.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no valido' },
        { status: 400 }
      )
    }

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pedido })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

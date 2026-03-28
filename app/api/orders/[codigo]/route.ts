import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params

    if (!codigo) {
      return NextResponse.json(
        { error: 'Codigo de pedido requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Try to find by order code first
    let { data: pedido, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('codigo', codigo)
      .single()

    // If not found by code, try by phone number
    if (!pedido) {
      const { data: pedidoByPhone, error: phoneError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('telefono', codigo)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (pedidoByPhone) {
        pedido = pedidoByPhone
        error = phoneError
      }
    }

    if (error || !pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', pedido.id)

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
    }

    return NextResponse.json({
      pedido: {
        ...pedido,
        items: items || [],
      },
    })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigoPedido, calificacion, comentario } = body

    // Validation
    if (!codigoPedido || !calificacion || !comentario) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    if (calificacion < 1 || calificacion > 5) {
      return NextResponse.json(
        { error: 'La calificacion debe ser entre 1 y 5' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify order exists
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, nombre_cliente')
      .eq('codigo', codigoPedido)
      .single()

    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Codigo de pedido no valido' },
        { status: 400 }
      )
    }

    // Check if review already exists for this order
    const { data: existingReview } = await supabase
      .from('resenas')
      .select('id')
      .eq('codigo_pedido', codigoPedido)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya existe una resena para este pedido' },
        { status: 400 }
      )
    }

    // Create review
    const { data: resena, error: resenaError } = await supabase
      .from('resenas')
      .insert({
        pedido_id: pedido.id,
        codigo_pedido: codigoPedido,
        nombre_cliente: pedido.nombre_cliente,
        calificacion,
        comentario,
        aprobada: false,
      })
      .select()
      .single()

    if (resenaError) {
      console.error('Error creating review:', resenaError)
      return NextResponse.json(
        { error: 'Error al crear la resena' },
        { status: 500 }
      )
    }

    return NextResponse.json({ resena })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateOrderCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PED-${year}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, telefono, email, tipoEntrega, direccion, items, subtotal, total } = body

    // Validation
    if (!nombre || !telefono || !email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    if (tipoEntrega === 'domicilio' && !direccion) {
      return NextResponse.json(
        { error: 'La direccion es obligatoria para envio a domicilio' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate unique order code
    let codigo = generateOrderCode()
    let codeExists = true
    let attempts = 0

    while (codeExists && attempts < 10) {
      const { data: existing } = await supabase
        .from('pedidos')
        .select('codigo')
        .eq('codigo', codigo)
        .single()

      if (!existing) {
        codeExists = false
      } else {
        codigo = generateOrderCode()
        attempts++
      }
    }

    // Create order
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        codigo,
        nombre_cliente: nombre,
        telefono,
        email,
        tipo_entrega: tipoEntrega,
        direccion: direccion || null,
        estado: 'pendiente',
        subtotal,
        total,
      })
      .select()
      .single()

    if (pedidoError) {
      console.error('Error creating order:', pedidoError)
      return NextResponse.json(
        { error: 'Error al crear el pedido' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item: {
      producto_id: string
      nombre_producto: string
      precio_unitario: number
      cantidad: number
      subtotal: number
    }) => ({
      pedido_id: pedido.id,
      producto_id: item.producto_id,
      nombre_producto: item.nombre_producto,
      precio_unitario: item.precio_unitario,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback: delete the order
      await supabase.from('pedidos').delete().eq('id', pedido.id)
      return NextResponse.json(
        { error: 'Error al crear los items del pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pedido })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

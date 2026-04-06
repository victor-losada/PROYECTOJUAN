import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

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

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('codigo', codigo)
      .single()

    if (error || !pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    const { data: items } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', pedido.id)

    // Generate HTML receipt (simple HTML-based receipt)
    const itemsHtml = (items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.nombre_producto}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.precio_unitario)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.subtotal)}</td>
        </tr>
      `
      )
      .join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recibo - ${pedido.codigo}</title>
  <style>
    body { font-family: 'Helvetica', 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #5D4037; }
    .order-code { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .order-code span { font-size: 24px; font-weight: bold; color: #5D4037; }
    .section { margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 10px; text-transform: uppercase; }
    .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .info-label { color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { text-align: left; padding: 10px 8px; background: #f5f5f5; font-size: 12px; text-transform: uppercase; }
    .total-row { font-size: 18px; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CoffeJuancho</div>
    <p style="color: #666; margin: 5px 0;">Cafe de Especialidad Colombiano</p>
  </div>

  <div class="order-code">
    <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">CODIGO DE PEDIDO</p>
    <span>${pedido.codigo}</span>
  </div>

  <div class="section">
    <div class="section-title">Informacion del Cliente</div>
    <div class="info-row">
      <span class="info-label">Nombre:</span>
      <span>${pedido.nombre_cliente}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span>${pedido.email}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Telefono:</span>
      <span>${pedido.telefono}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Entrega:</span>
      <span>${pedido.tipo_entrega === 'domicilio' ? 'Envio a domicilio' : 'Recoger en tienda'}</span>
    </div>
    ${pedido.direccion ? `
    <div class="info-row">
      <span class="info-label">Direccion:</span>
      <span>${pedido.direccion}</span>
    </div>
    ` : ''}
    <div class="info-row">
      <span class="info-label">Fecha:</span>
      <span>${formatDate(pedido.created_at)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Productos</div>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align: center;">Cant.</th>
          <th style="text-align: right;">Precio</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <div class="section" style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
    <div class="info-row">
      <span class="info-label">Subtotal:</span>
      <span>${formatPrice(pedido.subtotal)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Envio:</span>
      <span style="color: #4CAF50;">Gratis</span>
    </div>
    <div class="info-row total-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
      <span>Total:</span>
      <span style="color: #5D4037;">${formatPrice(pedido.total)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Gracias por tu compra en CoffeJuancho</p>
    <p>Calle 10 #5-23, Centro Historico, Bogota</p>
    <p>+57 300 123 4567 | hola@coffejuancho.com</p>
  </div>
</body>
</html>
`

    // Return as HTML with PDF-friendly headers
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="recibo-${pedido.codigo}.html"`,
      },
    })
  } catch (error) {
    console.error('Receipt generation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

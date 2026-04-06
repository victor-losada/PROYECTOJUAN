"use server"

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const estadoMessages: Record<string, { subject: string; message: string }> = {
  pendiente: {
    subject: 'Tu pedido ha sido recibido',
    message: 'Hemos recibido tu pedido y estamos procesándolo.',
  },
  confirmado: {
    subject: 'Tu pedido ha sido confirmado',
    message: 'Tu pedido ha sido confirmado y pronto comenzaremos a prepararlo.',
  },
  preparando: {
    subject: 'Estamos preparando tu pedido',
    message: 'Tu pedido está siendo preparado con el mejor café de nuestra finca.',
  },
  enviado: {
    subject: 'Tu pedido ha sido enviado',
    message: 'Tu pedido está en camino. Pronto lo recibirás.',
  },
  entregado: {
    subject: 'Tu pedido ha sido entregado',
    message: '¡Tu pedido ha sido entregado! Esperamos que disfrutes nuestro café.',
  },
  cancelado: {
    subject: 'Tu pedido ha sido cancelado',
    message: 'Lamentamos informarte que tu pedido ha sido cancelado.',
  },
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { method } = body // 'email' or 'whatsapp'

    // Get order details
    const { data: pedido, error: orderError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    const estadoInfo = estadoMessages[pedido.estado] || {
      subject: 'Actualización de tu pedido',
      message: `El estado de tu pedido es: ${pedido.estado}`,
    }

    if (method === 'email') {
      // Check if Resend API key is configured
      if (!process.env.RESEND_API_KEY) {
        return NextResponse.json(
          { error: 'El servicio de email no está configurado. Configure RESEND_API_KEY.' },
          { status: 503 }
        )
      }

      if (!pedido.email) {
        return NextResponse.json(
          { error: 'El cliente no tiene email registrado' },
          { status: 400 }
        )
      }

      // Send email using Resend
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
      const trackingUrl = `${baseUrl}/seguimiento?codigo=${pedido.codigo}`
      const reviewUrl = `${baseUrl}/resena/${pedido.codigo}`

      const { error: emailError } = await resend.emails.send({
        from: 'Café Caicedo <notificaciones@cafelaesperanza.com>',
        to: pedido.email,
        subject: `${estadoInfo.subject} - ${pedido.codigo}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #faf9f7; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background-color: #292524; padding: 30px; text-align: center; }
              .header h1 { color: #d4a574; margin: 0; font-size: 28px; }
              .content { padding: 40px 30px; }
              .content h2 { color: #292524; font-size: 22px; margin-bottom: 20px; }
              .content p { color: #57534e; line-height: 1.8; font-size: 16px; }
              .order-box { background-color: #faf9f7; padding: 20px; margin: 20px 0; border-left: 4px solid #d4a574; }
              .order-box p { margin: 5px 0; }
              .btn { display: inline-block; background-color: #292524; color: white; padding: 14px 28px; text-decoration: none; margin: 10px 5px 10px 0; font-size: 14px; }
              .footer { background-color: #292524; padding: 20px; text-align: center; }
              .footer p { color: #a8a29e; font-size: 12px; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Café Caicedo</h1>
              </div>
              <div class="content">
                <h2>${estadoInfo.subject}</h2>
                <p>Hola ${pedido.nombre_cliente},</p>
                <p>${estadoInfo.message}</p>
                <div class="order-box">
                  <p><strong>Código de pedido:</strong> ${pedido.codigo}</p>
                  <p><strong>Estado:</strong> ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}</p>
                  <p><strong>Total:</strong> $${pedido.total.toLocaleString('es-CO')}</p>
                </div>
                <p>
                  <a href="${trackingUrl}" class="btn">Rastrear Pedido</a>
                  ${pedido.estado === 'entregado' ? `<a href="${reviewUrl}" class="btn">Dejar Reseña</a>` : ''}
                </p>
              </div>
              <div class="footer">
                <p>Café Caicedo - Finca La Esperanza</p>
                <p>El mejor café del Huila, Colombia</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (emailError) {
        console.error('Error sending email:', emailError)
        return NextResponse.json(
          { error: 'Error al enviar el email' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: `Email enviado a ${pedido.email}` 
      })

    } else if (method === 'whatsapp') {
      if (!pedido.telefono) {
        return NextResponse.json(
          { error: 'El cliente no tiene teléfono registrado' },
          { status: 400 }
        )
      }

      // Generate WhatsApp URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
      const trackingUrl = `${baseUrl}/seguimiento?codigo=${pedido.codigo}`
      
      const whatsappMessage = encodeURIComponent(
        `¡Hola ${pedido.nombre_cliente}! 👋\n\n` +
        `${estadoInfo.message}\n\n` +
        `📦 *Pedido:* ${pedido.codigo}\n` +
        `📍 *Estado:* ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}\n` +
        `💰 *Total:* $${pedido.total.toLocaleString('es-CO')}\n\n` +
        `🔗 Rastrea tu pedido aquí: ${trackingUrl}\n\n` +
        `_Café Caicedo - Finca La Esperanza_`
      )

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = pedido.telefono.replace(/\D/g, '')
      // Add Colombia country code if not present
      const phoneWithCode = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`

      const whatsappUrl = `https://wa.me/${phoneWithCode}?text=${whatsappMessage}`

      return NextResponse.json({ 
        success: true, 
        whatsappUrl,
        message: 'URL de WhatsApp generada' 
      })
    }

    return NextResponse.json(
      { error: 'Método de notificación no válido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in notify:', error)
    return NextResponse.json(
      { error: 'Error al procesar la notificación' },
      { status: 500 }
    )
  }
}

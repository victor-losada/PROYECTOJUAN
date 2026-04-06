import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_xxxxxxxxxxxxxxxxxxxxxxxx'
const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || 'test_integrity_xxxxxxxxxxxxxxxxxxxxxxxx'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pedidoId, pedidoCodigo, total, email, nombre, telefono } = body

    // Validate required fields
    if (!pedidoId || !pedidoCodigo || !total || !email) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Amount in cents (Wompi requires amount in cents)
    const amountInCents = Math.round(total * 100)

    // Generate integrity signature
    const reference = pedidoCodigo
    const currency = 'COP'
    const integrityString = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`
    const integritySignature = crypto
      .createHash('sha256')
      .update(integrityString)
      .digest('hex')

    // Build Wompi checkout URL
    const redirectUrl = `${BASE_URL}/checkout/resultado?pedido=${pedidoCodigo}`
    
    const wompiParams = new URLSearchParams({
      'public-key': WOMPI_PUBLIC_KEY,
      currency: currency,
      'amount-in-cents': amountInCents.toString(),
      reference: reference,
      'signature:integrity': integritySignature,
      'redirect-url': redirectUrl,
      'customer-data:email': email,
      'customer-data:full-name': nombre || '',
      'customer-data:phone-number': telefono || '',
    })

    const checkoutUrl = `https://checkout.wompi.co/p/?${wompiParams.toString()}`

    return NextResponse.json({ 
      redirectUrl: checkoutUrl,
      reference,
      integritySignature 
    })
  } catch (error) {
    console.error('Wompi session creation error:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesion de pago' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || ''

interface WompiWebhookData {
  event: string
  data: {
    transaction: {
      id: string
      reference: string
      status: string
      amount_in_cents: number
      customer_email: string
    }
  }
  signature: {
    checksum: string
    properties: string[]
  }
  timestamp: number
}

function verifySignature(body: WompiWebhookData): boolean {
  if (!WOMPI_EVENTS_SECRET) {
    console.warn('WOMPI_EVENTS_SECRET not configured, skipping verification')
    return true
  }

  const { signature, data, timestamp } = body
  const properties = signature.properties
  
  // Build string to hash based on properties
  let stringToHash = ''
  for (const prop of properties) {
    const keys = prop.split('.')
    let value: unknown = data
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }
    stringToHash += value
  }
  stringToHash += timestamp
  stringToHash += WOMPI_EVENTS_SECRET

  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(stringToHash)
    .digest('hex')

  return calculatedChecksum === signature.checksum
}

export async function POST(request: NextRequest) {
  try {
    const body: WompiWebhookData = await request.json()

    // Verify signature (in production)
    if (WOMPI_EVENTS_SECRET && !verifySignature(body)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const { event, data } = body

    if (event === 'transaction.updated') {
      const { transaction } = data
      const { reference, status, id: transactionId } = transaction

      const supabase = await createClient()

      // Update order status based on Wompi status
      let orderStatus: string
      switch (status) {
        case 'APPROVED':
          orderStatus = 'pendiente' // Payment approved, waiting for preparation
          break
        case 'DECLINED':
        case 'ERROR':
        case 'VOIDED':
          orderStatus = 'cancelado'
          break
        default:
          orderStatus = 'pendiente'
      }

      const { error } = await supabase
        .from('pedidos')
        .update({
          wompi_transaction_id: transactionId,
          wompi_status: status,
          estado: status === 'APPROVED' ? 'pendiente' : orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('codigo', reference)

      if (error) {
        console.error('Error updating order:', error)
        return NextResponse.json(
          { error: 'Error updating order' },
          { status: 500 }
        )
      }

      console.log(`Order ${reference} updated with status: ${status}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

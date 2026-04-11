import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PRODUCT_SELECT = '*, muestras ( id, cantidad, precio, created_at )'

type MuestraInput = { cantidad: string; precio: number }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      muestras: muestrasBody,
      nombre,
      descripcion,
      precio,
      categoria,
      subcategoria,
      imagen_url,
      stock,
      activo,
      disponible,
      origen,
      nombre_finca,
      productor,
      altitud,
      cosecha,
      puntaje_sca,
      perfil_sensorial,
      metodo_secado,
      tiempo_secado,
      proceso,
      presentacion,
    } = body

    if (!nombre || precio === undefined || !categoria) {
      return NextResponse.json(
        { error: 'Campos obligatorios faltantes' },
        { status: 400 },
      )
    }

    let muestras: MuestraInput[] = []
    if (Array.isArray(muestrasBody)) {
      for (const row of muestrasBody) {
        const cantidad = String(row.cantidad ?? '').trim()
        const pr = Number(row.precio)
        if (!cantidad || Number.isNaN(pr) || pr <= 0) {
          return NextResponse.json(
            {
              error:
                'Cada muestra debe tener gramos y un precio mayor a cero',
            },
            { status: 400 },
          )
        }
        muestras.push({ cantidad, precio: pr })
      }
    }

    const { data: existing, error: exErr } = await supabase
      .from('productos')
      .select('id')
      .eq('id', id)
      .single()

    if (exErr || !existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const productUpdate = {
      nombre,
      descripcion: descripcion || null,
      precio,
      categoria,
      subcategoria: subcategoria || null,
      imagen_url: imagen_url || null,
      stock: stock || 0,
      activo: activo !== undefined ? activo : true,
      disponible: disponible !== undefined ? disponible : true,
      origen: origen || null,
      nombre_finca: nombre_finca || null,
      productor: productor || null,
      altitud: altitud || null,
      cosecha: cosecha || null,
      puntaje_sca: puntaje_sca || null,
      perfil_sensorial: perfil_sensorial || null,
      metodo_secado: metodo_secado || null,
      tiempo_secado: tiempo_secado || null,
      proceso: proceso || null,
      presentacion: presentacion || null,
      updated_at: new Date().toISOString(),
    }

    const { error: upErr } = await supabase
      .from('productos')
      .update(productUpdate)
      .eq('id', id)

    if (upErr) {
      console.error('Error updating product:', upErr)
      return NextResponse.json(
        { error: 'Error al actualizar el producto' },
        { status: 500 },
      )
    }

    await supabase.from('muestras').delete().eq('producto_id', id)

    if (muestras.length > 0) {
      const { error: insErr } = await supabase.from('muestras').insert(
        muestras.map((m) => ({
          cantidad: m.cantidad,
          precio: m.precio,
          producto_id: id,
        })),
      )
      if (insErr) {
        console.error('Error inserting muestras:', insErr)
        return NextResponse.json(
          { error: 'Error al guardar las muestras' },
          { status: 500 },
        )
      }
    }

    const { data: producto, error: fetchErr } = await supabase
      .from('productos')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .single()

    if (fetchErr || !producto) {
      return NextResponse.json(
        { error: 'No se pudo cargar el producto actualizado' },
        { status: 500 },
      )
    }

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { error } = await supabase.from('productos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el producto' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

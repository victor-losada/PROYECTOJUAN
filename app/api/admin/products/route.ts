import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      nombre, descripcion, precio, categoria, subcategoria, imagen_url, stock, activo, disponible,
      origen, nombre_finca, productor, altitud, cosecha, puntaje_sca, perfil_sensorial,
      metodo_secado, tiempo_secado, proceso, presentacion
    } = body

    if (!nombre || precio === undefined || !categoria) {
      return NextResponse.json(
        { error: 'Campos obligatorios faltantes' },
        { status: 400 }
      )
    }

    const { data: producto, error } = await supabase
      .from('productos')
      .insert({
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
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Error al crear el producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  categoria: string
  subcategoria: string
  imagen_url: string | null
  stock: number
  activo: boolean
  disponible: boolean
  // Ficha técnica
  origen: string | null
  nombre_finca: string | null
  productor: string | null
  altitud: string | null
  cosecha: string | null
  puntaje_sca: number | null
  perfil_sensorial: string | null
  metodo_secado: string | null
  tiempo_secado: string | null
  proceso: string | null
  presentacion: string | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  producto: Producto
  cantidad: number
}

export interface Pedido {
  id: string
  codigo: string
  nombre_cliente: string
  telefono: string
  email: string
  tipo_entrega: 'domicilio' | 'recoger'
  direccion: string | null
  estado: 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado'
  subtotal: number
  total: number
  wompi_transaction_id: string | null
  wompi_status: string | null
  created_at: string
  updated_at: string
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string | null
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
  created_at: string
}

export interface PedidoConItems extends Pedido {
  items: PedidoItem[]
}

export interface Resena {
  id: string
  pedido_id: string | null
  codigo_pedido: string
  nombre_cliente: string
  calificacion: number
  comentario: string | null
  aprobada: boolean
  created_at: string
}

export type EstadoPedido = Pedido['estado']

export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  en_preparacion: { label: 'En Preparacion', color: 'bg-blue-100 text-blue-800' },
  en_camino: { label: 'En Camino', color: 'bg-purple-100 text-purple-800' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}

export const CATEGORIAS = [
  { value: 'todos', label: 'Todos' },
  { value: 'regional_huila', label: 'Regional huila' },
  { value: 'varietales', label: 'Varietales' },
  { value: 'cofermentados', label: 'Cofermentados' },
] as const

export const SUBCATEGORIAS = {
  regional_huila: [
    { value: 'natural', label: 'Natural' },
    { value: 'suave_lavado', label: 'Suave Lavado' },
    
  ],
  varietales: [
    { value: 'natural', label: 'Natural' },
    { value: 'suave_lavado', label: 'Suave Lavado' },
    { value: 'honey', label: 'Honey' },
  ],
  cofermentados: [
    { value: 'natural', label: 'Natural' },
    { value: 'suave_lavado', label: 'Suave Lavado' },
  ],
} as const

export type Categoria = typeof CATEGORIAS[number]['value']

-- CoffeJuancho Database Schema
-- Tables: productos, pedidos, pedido_items, resenas

-- Productos table
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  categoria TEXT NOT NULL,
<<<<<<< HEAD
=======
  subcategoria TEXT DEFAULT '',
>>>>>>> afa3ce5 (video en el hero y cambios en las funciones del administrador)
  imagen_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo_entrega TEXT NOT NULL,
  direccion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  wompi_transaction_id TEXT,
  wompi_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedido Items table
CREATE TABLE IF NOT EXISTS pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  nombre_producto TEXT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resenas table
CREATE TABLE IF NOT EXISTS resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  codigo_pedido TEXT NOT NULL,
  nombre_cliente TEXT NOT NULL,
  calificacion INTEGER NOT NULL,
  comentario TEXT,
  aprobada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

# INSTRUCCIONES PARA EL DESARROLLADOR

## CoffeJuancho - Sistema de E-commerce para Cafe

Este documento contiene las instrucciones completas para configurar y desplegar la aplicacion.

---

## 1. CONFIGURACION DE SUPABASE

### 1.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta o inicia sesion
2. Crea un nuevo proyecto con un nombre descriptivo (ej: "coffejuancho-prod")
3. Guarda la contrasena de la base de datos en un lugar seguro
4. Espera a que el proyecto se inicialice completamente

### 1.2 Crear las Tablas

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

```sql
-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  categoria TEXT NOT NULL,
  imagen_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pedidos
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

-- Tabla de Items de Pedido
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

-- Tabla de Resenas
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

-- Indices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_pedidos_codigo ON pedidos(codigo);
CREATE INDEX IF NOT EXISTS idx_pedidos_telefono ON pedidos(telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_resenas_aprobada ON resenas(aprobada);
```

### 1.3 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- Politicas para productos (lectura publica)
CREATE POLICY "productos_public_read" ON productos FOR SELECT USING (true);
CREATE POLICY "productos_admin_all" ON productos FOR ALL USING (auth.role() = 'authenticated');

-- Politicas para pedidos
CREATE POLICY "pedidos_public_insert" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "pedidos_public_read" ON pedidos FOR SELECT USING (true);
CREATE POLICY "pedidos_admin_all" ON pedidos FOR ALL USING (auth.role() = 'authenticated');

-- Politicas para items de pedido
CREATE POLICY "pedido_items_public_insert" ON pedido_items FOR INSERT WITH CHECK (true);
CREATE POLICY "pedido_items_public_read" ON pedido_items FOR SELECT USING (true);
CREATE POLICY "pedido_items_admin_all" ON pedido_items FOR ALL USING (auth.role() = 'authenticated');

-- Politicas para resenas
CREATE POLICY "resenas_public_insert" ON resenas FOR INSERT WITH CHECK (true);
CREATE POLICY "resenas_public_read" ON resenas FOR SELECT USING (aprobada = true);
CREATE POLICY "resenas_admin_all" ON resenas FOR ALL USING (auth.role() = 'authenticated');
```

### 1.4 Insertar Productos de Ejemplo

```sql
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_url, stock, activo) VALUES
('Cafe Origen Huila', 'Granos de cafe 100% arabica de las montanas del Huila. Notas de chocolate y caramelo.', 45000, 'granos', '/images/placeholder-coffee.jpg', 50, true),
('Cafe Sierra Nevada', 'Cafe de altura con notas frutales y acidez brillante. Tostado medio.', 52000, 'granos', '/images/placeholder-coffee.jpg', 35, true),
('Cafe Narino Especial', 'Granos selectos de Narino. Perfil complejo con notas citricas.', 58000, 'granos', '/images/placeholder-coffee.jpg', 40, true),
('Molido Tradicional 500g', 'Cafe molido perfecto para cafetera de goteo. Tostado oscuro.', 32000, 'molido', '/images/placeholder-coffee.jpg', 100, true),
('Molido Espresso 250g', 'Molido fino ideal para maquinas de espresso. Intenso y cremoso.', 28000, 'molido', '/images/placeholder-coffee.jpg', 80, true),
('Prensa Francesa 350ml', 'Prensa francesa de vidrio borosilicato con marco de acero inoxidable.', 89000, 'accesorios', '/images/placeholder-coffee.jpg', 25, true),
('Molinillo Manual', 'Molinillo de cafe manual con rebabas de ceramica.', 125000, 'accesorios', '/images/placeholder-coffee.jpg', 15, true),
('Pack Descubrimiento', 'Kit de 3 cafes de origen (100g c/u) para conocer nuestros sabores.', 42000, 'ofertas', '/images/placeholder-coffee.jpg', 30, true);
```

### 1.5 Crear Usuario Administrador

1. En Supabase, ve a **Authentication > Users**
2. Click en **Add User** > **Create New User**
3. Ingresa:
   - Email: `admin@coffejuancho.com` (o el email que prefieras)
   - Password: Una contrasena segura
4. Click en **Create User**
5. (Opcional) Confirma el email manualmente en la seccion de usuarios

---

## 2. CONFIGURACION DE WOMPI

### 2.1 Crear Cuenta en Wompi

1. Ve a [wompi.co](https://wompi.co) y registrate como comercio
2. Completa el proceso de verificacion (para produccion)
3. Para pruebas, usa el modo **Sandbox**

### 2.2 Obtener Credenciales

En el panel de Wompi:

1. Ve a **Configuracion** > **Llaves de API**
2. Copia las siguientes llaves:
   - **Llave Publica (Sandbox)**: `pub_test_xxxxxxxxxxxxx`
   - **Llave de Integridad (Sandbox)**: `test_integrity_xxxxxxxxxxxxx`
   - **Llave de Eventos**: Para configurar webhooks

### 2.3 Tarjetas de Prueba (Sandbox)

Para probar pagos en modo sandbox:

| Numero de Tarjeta    | CVV | Fecha     | Resultado |
|---------------------|-----|-----------|-----------|
| 4242 4242 4242 4242 | 123 | 12/28     | Aprobada  |
| 4111 1111 1111 1111 | 123 | 12/28     | Declinada |

---

## 3. VARIABLES DE ENTORNO

Crea un archivo `.env.local` en la raiz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Wompi (usa tus llaves de sandbox para pruebas)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_KEY=test_integrity_xxxxxxxxxxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=tu_secret_de_eventos

# URL base (cambia en produccion)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Donde encontrar las llaves de Supabase:**
- Ve a tu proyecto en Supabase
- Click en **Settings** (engranaje) > **API**
- Copia `Project URL` y `anon public` key

---

## 4. CONFIGURAR WEBHOOK DE WOMPI

### 4.1 En Produccion

1. En el panel de Wompi, ve a **Configuracion** > **Webhooks**
2. Agrega un nuevo webhook:
   - **URL**: `https://tu-dominio.com/api/wompi/webhook`
   - **Eventos**: `transaction.updated`
3. Copia el **Secret** y agregalo a tus variables de entorno como `WOMPI_EVENTS_SECRET`

### 4.2 Para Desarrollo Local

Usa una herramienta como [ngrok](https://ngrok.com) para exponer tu localhost:

```bash
ngrok http 3000
```

Luego configura el webhook de Wompi con la URL de ngrok:
`https://xxxx.ngrok.io/api/wompi/webhook`

---

## 5. DEPLOY EN VERCEL

### 5.1 Desde la Interfaz de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesion
2. Click en **Add New** > **Project**
3. Importa tu repositorio de GitHub
4. En la configuracion del proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./ (dejar por defecto)
5. Agrega las **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`
   - `WOMPI_INTEGRITY_KEY`
   - `WOMPI_EVENTS_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (tu dominio de Vercel, ej: `https://coffejuancho.vercel.app`)
6. Click en **Deploy**

### 5.2 Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... agregar el resto de variables

# Deploy a produccion
vercel --prod
```

---

## 6. ESTRUCTURA DEL PROYECTO

```
/app
  /page.tsx                    # Landing page publica
  /checkout/page.tsx           # Pagina de checkout
  /checkout/resultado/page.tsx # Resultado del pago
  /seguimiento/page.tsx        # Seguimiento de pedidos + resenas
  /admin
    /login/page.tsx            # Login del admin
    /page.tsx                  # Dashboard
    /pedidos/page.tsx          # Gestion de pedidos
    /productos/page.tsx        # CRUD de productos
    /resenas/page.tsx          # Moderacion de resenas
  /api
    /orders/route.ts           # Crear pedidos
    /orders/[codigo]/route.ts  # Consultar pedido
    /reviews/route.ts          # Crear resenas
    /wompi/
      /create-session/route.ts # Iniciar pago
      /webhook/route.ts        # Recibir eventos de Wompi
    /admin/
      /orders/[id]/route.ts    # Actualizar pedidos
      /products/route.ts       # CRUD productos
      /reviews/[id]/route.ts   # Moderar resenas

/components
  /cart/                       # Carrito de compras
  /checkout/                   # Componentes de checkout
  /layout/                     # Header y Footer
  /products/                   # Tarjetas y grid de productos
  /sections/                   # Hero, Reviews
  /admin/                      # Componentes del admin

/lib
  /supabase/                   # Clientes de Supabase
  /types.ts                    # Tipos TypeScript
  /utils.ts                    # Utilidades
```

---

## 7. FLUJO DE COMPRA

1. **Cliente navega** la tienda y agrega productos al carrito
2. **Checkout**: Completa formulario con datos de contacto y entrega
3. **Pago**: Se redirige a Wompi para procesar el pago
4. **Confirmacion**: 
   - Wompi redirige de vuelta a `/checkout/resultado`
   - Se muestra el codigo de pedido (ej: PED-2026-1234)
   - Cliente puede descargar recibo
5. **Webhook**: Wompi envia confirmacion al `/api/wompi/webhook`
6. **Admin**: Ve el pedido en el panel, actualiza estado
7. **WhatsApp**: Admin envia informacion al cliente via WhatsApp
8. **Seguimiento**: Cliente consulta estado con su codigo
9. **Resena**: Cliente deja resena usando su codigo de pedido

---

## 8. NOTAS IMPORTANTES

### Seguridad
- Las llaves secretas (`WOMPI_INTEGRITY_KEY`, `WOMPI_EVENTS_SECRET`) NUNCA deben exponerse en el frontend
- Solo usa `NEXT_PUBLIC_` prefix para variables que necesitan estar en el cliente
- El panel de admin esta protegido por autenticacion de Supabase

### Produccion
- Cambia las llaves de Wompi de sandbox a produccion
- Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio real
- Configura el webhook de Wompi con tu URL de produccion
- Verifica que las politicas RLS esten correctamente configuradas

### Personalizacion
- Colores: Edita `/app/globals.css` para cambiar la paleta
- Logo: Reemplaza el icono Coffee por tu logo
- Imagenes: Sube imagenes reales de productos a `/public/images/` o usa URLs externas
- Textos: Modifica los textos en los componentes

---

## 9. SOPORTE

Para dudas o problemas:
- Documentacion de Supabase: https://supabase.com/docs
- Documentacion de Wompi: https://docs.wompi.co
- Documentacion de Next.js: https://nextjs.org/docs
- Documentacion de Vercel: https://vercel.com/docs

---

Desarrollado con Next.js 15, Supabase, Tailwind CSS y shadcn/ui.

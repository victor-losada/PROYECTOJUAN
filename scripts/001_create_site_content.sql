-- Crear tabla site_content para contenido multimedia editable
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar contenido inicial
INSERT INTO site_content (section, content_type, url) VALUES
  ('hero', 'video', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Video%202026-04-05%20at%205.55.36%20PM-kQKetNhsNhjUYCjgcGEZZrvQdRrWNp.mp4'),
  ('origin', 'image', '/images/origin-coffee.jpg'),
  ('process', 'image', '/images/process-coffee.jpg')
ON CONFLICT (section) DO NOTHING;

-- Habilitar RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Public can read site_content" ON site_content
  FOR SELECT USING (true);

-- Política de escritura para service role (admin)
CREATE POLICY "Service role can manage site_content" ON site_content
  FOR ALL USING (true) WITH CHECK (true);

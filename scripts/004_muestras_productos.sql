-- Muestras (gramos + precio) y vínculo opcional desde productos
-- Ejecutar en Supabase si aún no existe la tabla o la columna.

CREATE TABLE IF NOT EXISTS public.muestras (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  cantidad text NOT NULL,
  precio numeric(12, 2) NOT NULL
);

ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS muestra_id bigint REFERENCES public.muestras (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_productos_muestra_id ON public.productos (muestra_id);

ALTER TABLE public.muestras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "muestras_public_read" ON public.muestras;
CREATE POLICY "muestras_public_read" ON public.muestras
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "muestras_authenticated_all" ON public.muestras;
CREATE POLICY "muestras_authenticated_all" ON public.muestras
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

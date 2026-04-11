-- Varias muestras por producto: muestras.producto_id → productos.id
-- Ejecutar después de tener tablas productos y muestras.

ALTER TABLE public.muestras
  ADD COLUMN IF NOT EXISTS producto_id uuid REFERENCES public.productos (id) ON DELETE CASCADE;

-- Migrar relación antigua productos.muestra_id → muestras
UPDATE public.muestras m
SET producto_id = p.id
FROM public.productos p
WHERE p.muestra_id IS NOT NULL
  AND m.id = p.muestra_id;

-- Quitar filas huérfanas (sin producto) si quedaron de pruebas
DELETE FROM public.muestras WHERE producto_id IS NULL;

ALTER TABLE public.productos DROP COLUMN IF EXISTS muestra_id;

CREATE INDEX IF NOT EXISTS idx_muestras_producto_id ON public.muestras (producto_id);

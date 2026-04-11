-- Campos de ficha técnica (formulario admin → detalle público del producto)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS subcategoria TEXT DEFAULT '';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS origen TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS nombre_finca TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS productor TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS altitud TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS cosecha TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS puntaje_sca NUMERIC(4, 2);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS perfil_sensorial TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS metodo_secado TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tiempo_secado TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS proceso TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS presentacion TEXT;

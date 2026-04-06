-- Agregar columna disponible a productos (default true)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;

-- Actualizar todos los productos existentes como disponibles
UPDATE productos SET disponible = true WHERE disponible IS NULL;

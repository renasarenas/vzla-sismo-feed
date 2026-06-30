-- Agregar columna imagen_url a la tabla noticias
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Índice parcial para consultas de galería (solo filas con imagen)
CREATE INDEX IF NOT EXISTS idx_noticias_con_imagen
  ON noticias (publicado_at DESC)
  WHERE imagen_url IS NOT NULL AND factcheck_status = 'aprobado';

-- Zona geográfica afectada extraída por el fact-checker (estado venezolano).
-- null cuando la noticia no menciona una zona específica del país.
alter table noticias add column if not exists zona text;

-- Índice para filtrar rápido por zona en el feed.
create index if not exists noticias_zona_idx on noticias (zona)
  where factcheck_status = 'aprobado';

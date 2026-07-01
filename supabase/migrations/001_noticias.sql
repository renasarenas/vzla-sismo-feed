-- Tabla principal de noticias verificadas
create table if not exists noticias (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descripcion text,
  url text unique not null,
  fuente text not null,
  fuente_tipo text not null check (fuente_tipo in ('rss', 'x_twitter', 'oficial')),
  tag text not null check (tag in (
    'sismo', 'rescate', 'desaparecidos',
    'puntos_acopio', 'ayuda_humanitaria',
    'replicas', 'donaciones', 'internacional'
  )),

  -- Fact-checking via Groq (llama-3.3-70b)
  factcheck_status text not null default 'pendiente'
    check (factcheck_status in ('pendiente', 'aprobado', 'rechazado', 'dudoso')),
  factcheck_razon text,
  factcheck_confianza int check (factcheck_confianza between 0 and 100),

  publicado_at timestamptz,
  creado_at timestamptz default now()
);

-- Solo noticias aprobadas son visibles en el feed público
alter table noticias enable row level security;

create policy "feed_publico" on noticias
  for select using (factcheck_status = 'aprobado');

-- Index para el feed ordenado por tiempo
create index noticias_feed_idx on noticias (publicado_at desc)
  where factcheck_status = 'aprobado';

-- Habilitar realtime
alter publication supabase_realtime add table noticias;

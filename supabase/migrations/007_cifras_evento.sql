-- Cifras del "Resumen del evento" que antes estaban hardcodeadas en el frontend.
-- Tabla de una sola fila (id=1) que el mantenedor edita a mano desde el Table
-- Editor de Supabase cuando hay cifras nuevas; el sitio las lee automáticamente.
create table if not exists cifras_evento (
  id int primary key default 1,
  magnitud_1 text not null default 'M7.2',
  magnitud_2 text not null default 'M7.5',
  segundos_entre_sismos int not null default 40,
  epicentro text not null default 'Yaracuy / Carabobo',
  muertos int not null default 920,
  heridos int not null default 3360,
  desaparecidos int not null default 50000,
  fecha_cifras date not null default '2026-06-28',
  fuente text not null default 'medios verificados',
  actualizado_at timestamptz not null default now(),
  constraint cifras_evento_single_row check (id = 1)
);

insert into cifras_evento (id) values (1) on conflict (id) do nothing;

alter table cifras_evento enable row level security;

drop policy if exists "cifras_publicas" on cifras_evento;
create policy "cifras_publicas" on cifras_evento for select using (true);

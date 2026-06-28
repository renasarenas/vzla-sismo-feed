alter table noticias
  add column if not exists idioma text not null default 'es'
  check (idioma in ('es', 'en'));

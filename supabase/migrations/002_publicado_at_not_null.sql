-- publicado_at siempre se provee en el código; hacerlo NOT NULL evita nulos en el feed.
alter table noticias alter column publicado_at set not null;
alter table noticias alter column publicado_at set default now();

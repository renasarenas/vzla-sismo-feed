-- El fact-checker ahora extrae cifras de muertos/heridos/desaparecidos cuando
-- una noticia las menciona explícitamente (ver src/lib/factchecker.ts). El
-- resumen del evento en el frontend usa la cifra no-nula más reciente de cada
-- columna en vez de un número fijo editado a mano.
alter table noticias add column if not exists cifra_muertos int;
alter table noticias add column if not exists cifra_heridos int;
alter table noticias add column if not exists cifra_desaparecidos int;

-- Indicador de alerta de tsunami generada por un sismo (USGS).
-- Solo aplica a fuentes tipo 'oficial'; el resto de noticias quedan en false.
alter table noticias add column if not exists tsunami boolean not null default false;

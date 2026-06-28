# Política de seguridad

## Reportar una vulnerabilidad

**No abrir issues públicos para vulnerabilidades de seguridad.**

Si encuentras una vulnerabilidad, repórtala directamente por email a los mantenedores del proyecto. Se espera una respuesta en un máximo de 48 horas.

Mantenedores:
- renasarenas
- punkyyyy01

## Secretos del proyecto

Las siguientes variables de entorno son sensibles y nunca deben exponerse públicamente ni commitearse al repositorio:

| Variable | Por qué es sensible |
|----------|---------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Otorga acceso total a la base de datos saltando Row Level Security. Solo debe usarse en el servidor (API routes). Nunca incluirla en código del cliente ni en variables `NEXT_PUBLIC_`. |
| `GROQ_API_KEY` | Clave de facturación de la API de Groq. Si se expone, terceros pueden generar cargos. |
| `CRON_SECRET` | Protege el endpoint `/api/ingest` de llamadas no autorizadas. Sin este secret, cualquiera podría disparar el pipeline de ingestión. |

## Variables públicas por diseño

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son intencionalmente públicas y aparecen en el bundle del cliente. Esto es seguro porque el acceso a los datos está protegido por Row Level Security en Supabase.

## Scope del RLS

La política `feed_publico` en Supabase garantiza que aunque el `anon key` sea público, desde el cliente solo son accesibles las noticias con `factcheck_status = 'aprobado'`. Las noticias rechazadas o dudosas quedan en la base de datos para auditoría interna, pero son invisibles para cualquier cliente que use el anon key.

# Despliegue en Vercel

## Configuración por defecto

La SaaS Factory viene preconfigurada para Vercel. No necesitas ejecutar ningún script de preparación si estás empezando desde cero.

## Si vienes de otro target

Si el proyecto estaba preparado para EasyPanel u otro target:

```bash
npm run prepare:vercel
```

Esto restaura:
- `start` → `next start`

Nota: `postbuild` y `engines.node` permanecen en `package.json` pero son inocuos en Vercel (`postbuild` no hace nada sin `.next/standalone/`, y `engines` es buena práctica universal).

## Variables de entorno

Configura en el dashboard de Vercel (Settings → Environment Variables):

| Variable | Valor | Notas |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | URL de tu proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Clave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Solo server-side |
| `OPENROUTER_API_KEY` | `sk-or-...` | API key |

**No necesitas** configurar:
- `DEPLOY_TARGET` (default: vercel)
- `NEXT_PUBLIC_SITE_URL` (Vercel lo maneja via `VERCEL_URL`)
- `PORT` (Vercel lo maneja internamente)

## Despliegue

1. Conecta tu repositorio en Vercel
2. Vercel detecta Next.js automáticamente
3. Configura las env vars
4. Deploy

## Notas

- Vercel no usa `output: 'standalone'` — tiene su propio sistema de bundling
- El script `postbuild` (copy-standalone-assets) no hace nada en Vercel porque no existe `.next/standalone/`
- La configuración en `next.config.ts` es condicional: solo agrega `output: 'standalone'` si `DEPLOY_TARGET !== 'vercel'`

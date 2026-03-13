# Despliegue en EasyPanel

## Prerequisitos

- Proyecto basado en SaaS Factory
- Cuenta en EasyPanel con un servidor configurado
- Variables de entorno de producción listas (Supabase, OpenRouter, etc.)

## Paso 1: Preparar el proyecto

```bash
npm run prepare:easypanel
```

Este comando:
- Cambia `start` a `HOSTNAME=0.0.0.0 node .next/standalone/server.js` (escucha en todas las interfaces, necesario en contenedores)
- Agrega `engines.node >= 20`
- Configura `postbuild` para copiar assets estáticos automáticamente
- Verifica `.nvmrc` y `.gitignore`

## Paso 2: Configurar variables de entorno en EasyPanel

Variables **obligatorias** en la configuración del servicio:

| Variable | Valor | Notas |
|----------|-------|-------|
| `DEPLOY_TARGET` | `easypanel` | Activa `output: 'standalone'` en el build |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.com` | Sin trailing slash |
| `PORT` | `3000` | Puerto del servidor |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Clave service role (solo server-side) |
| `OPENROUTER_API_KEY` | `sk-or-...` | API key de OpenRouter |

## Paso 3: Configurar EasyPanel

En la configuración del servicio:

- **Build command**: `npm run build`
- **Start command**: `npm start`
- **Node version**: 20+ (Nixpacks lo detecta via `.nvmrc`)

## Paso 4: Desplegar

Push a tu repositorio. EasyPanel + Nixpacks harán:

1. Detectar Node.js via `.nvmrc`
2. `npm install`
3. `npm run build` → Next.js compila con `output: 'standalone'`
4. `postbuild` → Copia `.next/static` y `public/` al directorio standalone
5. `npm start` → Ejecuta `HOSTNAME=0.0.0.0 node .next/standalone/server.js`

## Troubleshooting

### Error 404 en `/_next/static/...`
Los assets estáticos no se copiaron al standalone. Verifica que el script `postbuild` se ejecutó:
```bash
ls .next/standalone/.next/static
ls .next/standalone/public
```

### La app compila pero no es accesible desde internet
- Verifica que el script `start` incluye `HOSTNAME=0.0.0.0` (necesario para que el servidor escuche fuera del contenedor)
- Verifica que `DEPLOY_TARGET=easypanel` está seteado como env var en EasyPanel
- Verifica que `NEXT_PUBLIC_SITE_URL` apunta a tu dominio real
- Revisa los logs del servicio en EasyPanel

### Error de Supabase en producción
- Verifica que las env vars de Supabase están correctas
- Verifica que RLS está habilitado en las tablas necesarias
- Las vars `NEXT_PUBLIC_*` deben estar disponibles en build time

### Nixpacks no detecta Node.js
- Asegúrate de que `.nvmrc` existe con el contenido `20`
- Asegúrate de que `engines.node` está en `package.json`

## Volver a Vercel

Si necesitas cambiar el target de despliegue:
```bash
npm run prepare:vercel
```
Esto restaura la configuración para Vercel.

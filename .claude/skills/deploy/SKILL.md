---
name: deploy
description: Prepara el proyecto para despliegue en un target específico (vercel, easypanel). Ejecuta validaciones, ajusta configuración y guía al usuario paso a paso.
---

# Deploy - Preparación Multi-Target

## Purpose
Preparar un proyecto SaaS Factory para despliegue en un target específico, aplicando todas las configuraciones necesarias y validando que el proyecto esté listo.

## When to Use
- Cuando el usuario dice "prepara para EasyPanel", "deploy en EasyPanel", "quiero desplegar en EasyPanel"
- Cuando el usuario dice "prepara para Vercel", "vuelve a Vercel"
- Cuando el usuario pregunta cómo desplegar el proyecto
- Cuando el usuario menciona "deploy", "despliegue", "producción" junto con un target

## Targets Soportados

| Target | Comando | Documentación |
|--------|---------|---------------|
| `vercel` | `npm run prepare:vercel` | `deploy/vercel.md` |
| `easypanel` | `npm run prepare:easypanel` | `deploy/easypanel.md` |

## How to Use

### Paso 1: Identificar el target
Pregunta al usuario si no es claro: "¿Para qué plataforma quieres desplegar? (vercel / easypanel)"

### Paso 2: Ejecutar preparación
```bash
npm run prepare:<target>
```

### Paso 3: Revisar el output
El script reporta qué cambios hizo y qué queda pendiente.

### Paso 4: Verificar variables de entorno
Lee `deploy/<target>.md` para la lista completa de variables requeridas.

### Paso 5: Build de prueba (opcional pero recomendado)
```bash
# Para EasyPanel:
DEPLOY_TARGET=easypanel npm run build

# Para Vercel:
npm run build
```

## Detalles Técnicos

### Cómo funciona `DEPLOY_TARGET`
La variable `DEPLOY_TARGET` en `next.config.ts` controla si se activa `output: 'standalone'`:
- `vercel` (default): No agrega standalone, Vercel maneja su propio bundling
- `easypanel`: Agrega `output: 'standalone'` para generar el servidor autónomo

### Script `copy-standalone-assets.js`
Después del build con standalone, Next.js NO copia `.next/static/` ni `public/` al directorio standalone. Este script lo hace automáticamente via `postbuild`. Solo actúa si existe `.next/standalone/`.

### Cambiar de target
Los targets son mutuamente exclusivos en `package.json` (el script `start` cambia). Para cambiar:
```bash
npm run prepare:vercel    # restaura configuración Vercel
npm run prepare:easypanel # cambia a EasyPanel
```

## Archivos Involucrados

| Archivo | Rol |
|---------|-----|
| `next.config.ts` | Configuración condicional via `DEPLOY_TARGET` |
| `package.json` | Scripts `start`, `postbuild`, `engines` |
| `.nvmrc` | Versión de Node para Nixpacks |
| `.env.example` | Template de variables de entorno |
| `scripts/prepare-deploy.js` | Script maestro de preparación |
| `scripts/copy-standalone-assets.js` | Copia assets post-build para standalone |
| `deploy/easypanel.md` | Guía completa para EasyPanel |
| `deploy/vercel.md` | Guía completa para Vercel |

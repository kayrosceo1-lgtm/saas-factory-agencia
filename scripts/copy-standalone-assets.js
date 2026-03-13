#!/usr/bin/env node

/**
 * SaaS Factory - Copy Standalone Assets
 *
 * Después de `next build` con output: 'standalone', Next.js NO copia
 * automáticamente las carpetas `public/` y `.next/static/` al directorio
 * standalone. Esto causa errores 404 en /_next/static/... en producción.
 *
 * Este script copia esos assets al lugar correcto.
 * Se ejecuta automáticamente via "postbuild" en package.json.
 *
 * Solo actúa si existe .next/standalone/ (es decir, si se compiló
 * con output: 'standalone'). Si no existe, no hace nada.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const STANDALONE = path.join(ROOT, '.next', 'standalone')
const STATIC_SRC = path.join(ROOT, '.next', 'static')
const STATIC_DEST = path.join(STANDALONE, '.next', 'static')
const PUBLIC_SRC = path.join(ROOT, 'public')
const PUBLIC_DEST = path.join(STANDALONE, 'public')

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return 0

  fs.mkdirSync(dest, { recursive: true })
  let count = 0

  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      count += copyDirSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      count++
    }
  }

  return count
}

// Detectar inconsistencia: start apunta a standalone pero no se generó standalone
if (!fs.existsSync(STANDALONE)) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  const startCmd = pkg.scripts && pkg.scripts.start || ''

  if (startCmd.includes('standalone')) {
    console.warn('\n⚠️  ADVERTENCIA: El script "start" apunta a standalone pero .next/standalone/ no existe.')
    console.warn('   Esto significa que el build NO se hizo con output: \'standalone\'.')
    console.warn('')
    console.warn('   Causa probable: falta DEPLOY_TARGET=easypanel como variable de entorno.')
    console.warn('')
    console.warn('   Solución:')
    console.warn('     DEPLOY_TARGET=easypanel npm run build')
    console.warn('')
    console.warn('   O en EasyPanel, asegúrate de que DEPLOY_TARGET=easypanel está configurado.\n')
  }

  process.exit(0)
}

console.log('\n📦 Copiando assets para standalone deployment...\n')

// Copiar .next/static → .next/standalone/.next/static
if (fs.existsSync(STATIC_SRC)) {
  const count = copyDirSync(STATIC_SRC, STATIC_DEST)
  console.log(`  ✅ .next/static → standalone (.next/static) [${count} archivos]`)
} else {
  console.warn('  ⚠️  .next/static no encontrado (el build puede no tener assets estáticos)')
}

// Copiar public/ → .next/standalone/public
if (fs.existsSync(PUBLIC_SRC)) {
  const count = copyDirSync(PUBLIC_SRC, PUBLIC_DEST)
  console.log(`  ✅ public/ → standalone (public/) [${count} archivos]`)
} else {
  console.log('  ℹ️  No hay carpeta public/ para copiar')
}

console.log('\n📦 Assets copiados exitosamente.\n')

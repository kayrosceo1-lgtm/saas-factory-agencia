#!/usr/bin/env node

/**
 * SaaS Factory - Multi-Target Deploy Preparation
 *
 * Prepara el proyecto para despliegue en un target específico.
 *
 * Uso:
 *   node scripts/prepare-deploy.js easypanel
 *   node scripts/prepare-deploy.js vercel
 *   npm run prepare:easypanel
 *   npm run prepare:vercel
 *
 * Este script NO ejecuta el build. Solo configura el proyecto
 * para que el build y despliegue funcionen correctamente en el target.
 */

const fs = require('fs')
const path = require('path')

const TARGETS = ['vercel', 'easypanel']
const ROOT = path.resolve(__dirname, '..')

const target = process.argv[2]

if (!target || !TARGETS.includes(target)) {
  console.error(`\n  Error: Target inválido "${target || '(ninguno)'}"\n`)
  console.error(`  Targets disponibles: ${TARGETS.join(', ')}`)
  console.error(`\n  Uso: node scripts/prepare-deploy.js <target>\n`)
  process.exit(1)
}

console.log(`\n🏭 SaaS Factory - Preparando para: ${target.toUpperCase()}\n`)

// --- Helpers ---

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), 'utf8'))
}

function writeJSON(filePath, data) {
  fs.writeFileSync(path.join(ROOT, filePath), JSON.stringify(data, null, 2) + '\n')
}

function fileExists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath))
}

function checkEnvFile() {
  if (!fileExists('.env.local') && !fileExists('.env')) {
    console.warn('  ⚠️  No se encontró .env.local ni .env')
    console.warn('     Copia .env.example → .env.local y configura las variables')
    return false
  }
  return true
}

// --- Validaciones comunes ---

function validateCommon() {
  const issues = []

  // Verificar que existe .env
  if (!checkEnvFile()) {
    issues.push('Archivo .env.local o .env no encontrado')
  }

  // Verificar dependencias instaladas
  if (!fileExists('node_modules')) {
    issues.push('node_modules no existe. Ejecuta: npm install')
  }

  return issues
}

// --- Perfil: Vercel ---

function prepareVercel() {
  console.log('  📋 Configurando para Vercel...\n')

  const pkg = readJSON('package.json')
  let changed = false

  // Asegurar que start sea "next start" (el default de Vercel)
  if (pkg.scripts.start !== 'next start') {
    pkg.scripts.start = 'next start'
    changed = true
    console.log('  ✅ script "start" → "next start"')
  }

  // Remover DEPLOY_TARGET si estaba seteado a otra cosa
  // (Vercel no necesita DEPLOY_TARGET, es el default)

  if (changed) {
    writeJSON('package.json', pkg)
    console.log('  ✅ package.json actualizado')
  } else {
    console.log('  ✅ package.json ya está configurado para Vercel')
  }

  console.log('')
  console.log('  📌 Recordatorios para Vercel:')
  console.log('     - DEPLOY_TARGET no es necesario (default: vercel)')
  console.log('     - NEXT_PUBLIC_SITE_URL se autoconfigura via VERCEL_URL')
  console.log('     - Configura las demás env vars en el dashboard de Vercel')
  console.log('')
}

// --- Perfil: EasyPanel ---

function prepareEasyPanel() {
  console.log('  📋 Configurando para EasyPanel...\n')

  const pkg = readJSON('package.json')
  let pkgChanged = false

  // 1. Script start para standalone (HOSTNAME=0.0.0.0 necesario para contenedores)
  const standaloneStart = 'HOSTNAME=0.0.0.0 node .next/standalone/server.js'
  if (pkg.scripts.start !== standaloneStart) {
    pkg.scripts.start = standaloneStart
    pkgChanged = true
    console.log('  ✅ script "start" → standalone server')
  }

  // 2. engines.node
  if (!pkg.engines || pkg.engines.node !== '>=20.0.0') {
    pkg.engines = { node: '>=20.0.0' }
    pkgChanged = true
    console.log('  ✅ engines.node → >=20.0.0')
  }

  // 3. Script postbuild para copiar assets estáticos
  if (!pkg.scripts.postbuild || !pkg.scripts.postbuild.includes('copy-standalone-assets')) {
    pkg.scripts.postbuild = 'node scripts/copy-standalone-assets.js'
    pkgChanged = true
    console.log('  ✅ script "postbuild" → copia assets estáticos')
  }

  if (pkgChanged) {
    writeJSON('package.json', pkg)
    console.log('  ✅ package.json actualizado')
  }

  // 4. Verificar .nvmrc
  if (!fileExists('.nvmrc')) {
    fs.writeFileSync(path.join(ROOT, '.nvmrc'), '20\n')
    console.log('  ✅ .nvmrc creado (Node 20)')
  } else {
    console.log('  ✅ .nvmrc ya existe')
  }

  // 5. Verificar que tsconfig.tsbuildinfo está en .gitignore
  const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8')
  if (!gitignore.includes('tsconfig.tsbuildinfo')) {
    fs.appendFileSync(path.join(ROOT, '.gitignore'), '\n# Build artifacts\ntsconfig.tsbuildinfo\n')
    console.log('  ✅ tsconfig.tsbuildinfo añadido a .gitignore')
  }

  console.log('')
  console.log('  📌 Checklist para EasyPanel:')
  console.log('     1. Setea DEPLOY_TARGET=easypanel en las env vars de EasyPanel')
  console.log('     2. Setea NEXT_PUBLIC_SITE_URL=https://tu-dominio.com')
  console.log('     3. Setea PORT=3000 (o el puerto que uses)')
  console.log('     4. Configura todas las vars de Supabase y OpenRouter')
  console.log('     5. Build command: npm run build')
  console.log('     6. Start command: npm start')
  console.log('     7. Nixpacks detectará Node.js automáticamente')
  console.log('')
  console.log('  📌 Para hacer build local de prueba:')
  console.log('     DEPLOY_TARGET=easypanel npm run build')
  console.log('')
}

// --- Main ---

const issues = validateCommon()

if (issues.length > 0) {
  console.warn('  ⚠️  Problemas detectados:')
  issues.forEach(i => console.warn(`     - ${i}`))
  console.warn('')
}

switch (target) {
  case 'vercel':
    prepareVercel()
    break
  case 'easypanel':
    prepareEasyPanel()
    break
}

console.log(`🏭 Preparación para ${target.toUpperCase()} completada.\n`)

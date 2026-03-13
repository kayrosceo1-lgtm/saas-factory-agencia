#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const currentDir = process.cwd();
const templateDir = path.join(__dirname, '..');

console.log(`🚀 Inicializando nueva SaaS Factory en: ${currentDir}`);

const ignoreList = [
    'node_modules',
    '.git',
    '.next',
    'bin',
    'package-lock.json',
    '.env.local',
    'tsconfig.tsbuildinfo',
    '.vercel'
];

try {
    const items = fs.readdirSync(templateDir);

    items.forEach(item => {
        if (ignoreList.includes(item)) return;

        const srcPath = path.join(templateDir, item);
        const destPath = path.join(currentDir, item);

        const isDir = fs.lstatSync(srcPath).isDirectory();
        if (isDir) {
            execSync(`xcopy /E /I /H /Y "${srcPath}" "${destPath}\\"`, { stdio: 'ignore' });
        } else {
            execSync(`copy /Y "${srcPath}" "${destPath}"`, { stdio: 'ignore' });
        }
    });

    console.log('✅ Archivos copiados exitosamente.');
    console.log('📦 Ahora ejecuta: npm install');

} catch (error) {
    console.error('❌ Error al copiar los archivos:', error.message);
}

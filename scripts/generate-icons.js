/**
 * Script de génération d'icônes PWA
 * Génère toutes les tailles d'icônes nécessaires à partir du logo
 * 
 * Pour utiliser ce script:
 * 1. npm install -D sharp
 * 2. node scripts/generate-icons.js
 * 
 * Note: Si sharp n'est pas disponible, créez les icônes manuellement
 * ou utilisez un outil en ligne comme realfavicongenerator.net
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tailles d'icônes nécessaires pour PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    const inputPath = path.join(__dirname, '../public/logo.png');
    const outputDir = path.join(__dirname, '../public/icons');

    // Créer le dossier icons s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎨 Génération des icônes PWA...\n');

    // Générer chaque taille d'icône
    for (const size of ICON_SIZES) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Généré: icon-${size}x${size}.png`);
    }

    console.log('\n✨ Toutes les icônes ont été générées avec succès !');
    console.log(`📁 Dossier: ${outputDir}`);

  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error);
    console.log('\n📝 Solutions alternatives:');
    console.log('1. Utiliser un outil en ligne: https://realfavicongenerator.net/');
    console.log('2. Créer les icônes manuellement dans public/icons/');
    console.log('\nTailles requises:', ICON_SIZES.map(s => `${s}x${s}`).join(', '));
    process.exit(1);
  }
}

// Exécuter la génération
generateIcons();


require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para obtener todos los archivos de una carpeta
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Solo archivos de imagen
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

// Función para subir una imagen
async function uploadImage(filePath, folder = 'punto-pas') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: false,
      overwrite: false, // No sobrescribir si ya existe
    });
    
    console.log(`✅ Subido: ${path.basename(filePath)}`);
    console.log(`   URL: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Error subiendo ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

// Función principal
async function uploadFolder(folderPath, folderName = 'punto-pas') {
  console.log(`📁 Buscando imágenes en: ${folderPath}\n`);
  
  const files = getAllFiles(folderPath);
  console.log(`🖼️  Encontradas ${files.length} imágenes\n`);
  
  if (files.length === 0) {
    console.log('No se encontraron imágenes.');
    return;
  }

  const results = [];
  
  // Subir imágenes en lotes de 10 para no sobrecargar
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`\n📤 Subiendo lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(files.length/batchSize)}...`);
    
    const batchResults = await Promise.all(
      batch.map(file => uploadImage(file, folderName))
    );
    
    results.push(...batchResults.filter(r => r !== null));
    
    // Pequeña pausa entre lotes
    if (i + batchSize < files.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✨ Completado!`);
  console.log(`📊 Total subido: ${results.length} de ${files.length} imágenes`);
  
  // Guardar resultados en un archivo JSON
  const outputFile = 'cloudinary-upload-results.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Resultados guardados en: ${outputFile}`);
  
  return results;
}

// Uso: node upload-to-cloudinary.js ./ruta/a/tu/carpeta
const folderPath = process.argv[2] || './imagenes';
uploadFolder(folderPath);

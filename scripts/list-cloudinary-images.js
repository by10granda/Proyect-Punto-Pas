require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbbkpdhze',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function listAllImages() {
  console.log('🔍 Obteniendo imágenes de Cloudinary...\n');
  
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
    });
    
    const imageMapping = {};
    let count = 0;
    
    result.resources.forEach(resource => {
      const filename = resource.display_name || resource.public_id.split('/').pop();
      const parts = filename.split('_');
      const codigoProducto = parts[0];
      
      if (codigoProducto && codigoProducto.match(/^\d+$/)) {
        if (!imageMapping[codigoProducto]) {
          imageMapping[codigoProducto] = resource.secure_url;
          count++;
        }
      }
    });
    
    console.log(`✅ Se encontraron ${count} imágenes con códigos de producto\n`);
    
    const output = `// Mapa de imágenes de productos
// Generado automáticamente - ${new Date().toISOString()}

export const productImages: Record<string, string> = ${JSON.stringify(imageMapping, null, 2)};
`;
    
    require('fs').writeFileSync('./src/data/productImages.ts', output);
    console.log('📝 Mapeo guardado en: src/data/productImages.ts');
    
    console.log('\n📊 Primeros 10 mappings:');
    Object.entries(imageMapping).slice(0, 10).forEach(([code, url]) => {
      console.log(`  ${code} -> ${url}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401')) {
      console.log('\n⚠️  Necesitas configurar las credenciales en el archivo .env');
      console.log('   Copia .env.example a .env y agrega tus credenciales de Cloudinary');
    }
  }
}

listAllImages();

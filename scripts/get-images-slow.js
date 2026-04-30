const cloudinary = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dbbkpdhze',
  api_key: '551695691832236',
  api_secret: 'GiVf3QH47GrSYU58xwqAVAdFWQs',
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function listAllImages() {
  console.log('🔍 Buscando imágenes en carpeta PRODUCTOS...\n');
  
  const imageMapping = {};
  let count = 0;
  let next_cursor = null;
  let batch = 0;
  
  try {
    do {
      batch++;
      console.log(`📡 Lote ${batch}...`);
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.api.resources({
          type: 'upload',
          prefix: 'PRODUCTOS/',
          max_results: 100,
          next_cursor: next_cursor
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      console.log(`📦 Encontradas ${result.resources.length} imágenes`);
      
      result.resources.forEach(resource => {
        const publicId = resource.public_id || '';
        const filename = publicId.split('/').pop() || '';
        
        const match = filename.match(/^(\d+)_/);
        if (match) {
          const codigoProducto = match[1];
          if (!imageMapping[codigoProducto]) {
            imageMapping[codigoProducto] = resource.secure_url;
            count++;
          }
        }
      });
      
      next_cursor = result.next_cursor;
      
      if (next_cursor) {
        console.log('⏳ Esperando 5 segundos...\n');
        await sleep(5000);
      }
      
    } while (next_cursor);
    
    console.log(`\n✅ Total: ${count} imágenes con códigos de producto\n`);
    
    const content = `// Mapa de imágenes de productos
// Generado automáticamente - ${new Date().toISOString()}

export const productImages: Record<string, string> = ${JSON.stringify(imageMapping, null, 2)};
`;
    
    const outputPath = './src/data/productImages.ts';
    fs.writeFileSync(outputPath, content);
    console.log('📝 Mapeo guardado en:', outputPath);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listAllImages();

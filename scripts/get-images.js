const cloudinary = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dbbkpdhze',
  api_key: '551695691832236',
  api_secret: 'GiVf3QH47GrSYU58xwqAVAdFWQs',
});

async function listAllImages() {
  console.log('🔍 Buscando imágenes en carpeta PRODUCTOS...\n');
  
  const imageMapping = {};
  const allFilenames = new Set();
  let count = 0;
  let next_cursor = null;
  
  try {
    console.log('📡 Conectando a Cloudinary...\n');
    
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'PRODUCTOS/',
        max_results: 500,
        next_cursor: next_cursor
      });
      
      console.log(`📦 Lote encontrado: ${result.resources.length} imágenes`);
      
      result.resources.forEach(resource => {
        const publicId = resource.public_id || '';
        const filename = publicId.split('/').pop() || '';
        allFilenames.add(filename);
        
        const parts = filename.split('_');
        const codigoProducto = parts[0];
        
        if (codigoProducto && codigoProducto.match(/^\d{5,}$/)) {
          if (!imageMapping[codigoProducto]) {
            imageMapping[codigoProducto] = resource.secure_url;
            count++;
          }
        }
      });
      
      next_cursor = result.next_cursor;
    } while (next_cursor);
    
    console.log(`\n✅ Total: ${count} imágenes con códigos de producto\n`);
    
    console.log('📋 Muestra de nombres de archivo:');
    Array.from(allFilenames).slice(0, 30).forEach(name => console.log(`  ${name}`));
    
    const content = `// Mapa de imágenes de productos
// Generado automáticamente - ${new Date().toISOString()}

export const productImages: Record<string, string> = ${JSON.stringify(imageMapping, null, 2)};
`;
    
    const outputPath = './src/data/productImages.ts';
    fs.writeFileSync(outputPath, content);
    console.log('\n📝 Mapeo guardado en:', outputPath);
    
    console.log('\n📊 Primeros 10 mappings:');
    Object.entries(imageMapping).slice(0, 10).forEach(([code, url]) => {
      console.log(`  ${code} -> ${url}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listAllImages();

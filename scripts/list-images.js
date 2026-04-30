const https = require('https');
const fs = require('fs');

const CLOUD_NAME = 'dbbkpdhze';
const API_KEY = '551695691832236';
const API_SECRET = 'GiVf3QH47GrSYU58xwqAVAdFWQs';

function generateSignature(params, secret) {
  const crypto = require('crypto');
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(toSign + secret).digest('hex');
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function listAllImages() {
  console.log('🔍 Buscando imágenes en Cloudinary...\n');
  
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp: timestamp,
    api_key: API_KEY,
  };
  const signature = generateSignature(params, API_SECRET);
  
  const imageMapping = {};
  let nextCursor = null;
  let total = 0;
  
  do {
    let url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?max_results=100&timestamp=${timestamp}&api_key=${API_KEY}&signature=${signature}`;
    if (nextCursor) {
      url += `&next_cursor=${nextCursor}`;
    }
    
    console.log(`📡 Solicitando...`);
    const data = await fetchJson(url);
    
    if (data && data.resources) {
      data.resources.forEach(resource => {
        const publicId = resource.public_id || '';
        const filename = publicId.split('/').pop() || '';
        const parts = filename.split('_');
        const codigoProducto = parts[0];
        
        if (codigoProducto && codigoProducto.match(/^\d+$/) && codigoProducto.length >= 5) {
          if (!imageMapping[codigoProducto]) {
            imageMapping[codigoProducto] = resource.secure_url;
            total++;
          }
        }
      });
      
      nextCursor = data.next_cursor;
      console.log(`📦 Encontradas ${total} imágenes hasta ahora...`);
    } else if (data && data.error) {
      console.log('❌ Error:', data.error.message);
      break;
    } else {
      break;
    }
    
  } while (nextCursor);
  
  console.log(`\n✅ Total: ${total} imágenes mapeadas\n`);
  
  const content = `// Mapa de imágenes de productos
// Generado automáticamente - ${new Date().toISOString()}

export const productImages: Record<string, string> = ${JSON.stringify(imageMapping, null, 2)};
`;
  
  fs.writeFileSync('./src/data/productImages.ts', content);
  console.log('📝 Guardado en: src/data/productImages.ts');
  
  console.log('\n📊 Primeros 10:');
  Object.entries(imageMapping).slice(0, 10).forEach(([code, url]) => {
    console.log(`  ${code} -> ${url}`);
  });
}

listAllImages().catch(console.error);

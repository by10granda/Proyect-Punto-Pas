# Subir Imágenes a Cloudinary

## Instrucciones rápidas

### 1. Instalar dependencias
```bash
cd scripts
npm install
```

### 2. Configurar credenciales
Copia el archivo de ejemplo y edítalo:
```bash
cp .env.example .env
```

Edita `.env` y añade tus credenciales de Cloudinary:
```
CLOUDINARY_CLOUD_NAME=tu_nombre
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Preparar carpeta de imágenes
Coloca todas tus imágenes en una carpeta, por ejemplo:
```
imagenes/
  ├── productos/
  │   ├── martillo.jpg
  │   └── taladro.jpg
  └── categorias/
      ├── ferreteria.jpg
      └── electricidad.jpg
```

### 4. Ejecutar el script
```bash
# Subir desde la carpeta 'imagenes' (por defecto)
npm run upload

# O especificar otra carpeta
npm run upload -- ../mis-imagenes

# O directamente con node
node upload-to-cloudinary.js ./ruta/a/tu/carpeta
```

## Qué hace el script

✅ **Sube todas las imágenes** de la carpeta (incluyendo subcarpetas)
✅ **Evita duplicados** (no sobrescribe si ya existe)
✅ **Organiza en carpetas** en Cloudinary
✅ **Genera un JSON** con todas las URLs resultantes
✅ **Soporta**: JPG, PNG, GIF, WEBP, SVG

## Resultado

El script creará un archivo `cloudinary-upload-results.json` con:
```json
[
  {
    "public_id": "punto-pas/martillo",
    "secure_url": "https://res.cloudinary.com/.../martillo.jpg",
    ...
  }
]
```

## Ver tus imágenes

Ve a: `https://cloudinary.com/console` → Media Library

## URLs de acceso

- **URL completa**: `https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{filename}`
- **URL optimizada**: `https://res.cloudinary.com/{cloud_name}/image/upload/w_500,q_auto/{folder}/{filename}`

## Límites del plan gratuito

- 25 GB de almacenamiento
- 25 GB de transferencia mensual
- 25,000 transformaciones mensuales

Para 15,000 productos con imágenes de 500KB cada una ≈ 7.5 GB ✓

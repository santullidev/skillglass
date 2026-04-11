import { createClient } from '@sanity/client'
import crypto from 'crypto'

// Note: This script is meant to be run via Sanity CLI:
// npx sanity exec scripts/seed-colecciones.ts --with-user-token

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'obhj76tx',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const seedData = async () => {
  console.log('🔄 Iniciando sembrado de productos de muestra para Luz Fundida...')

  // 1. Crear productos (basado en mimetizar piezas de la colección de Stitch)
  const productosMock = [
    {
      _type: 'producto',
      _id: 'prod-luz-fundida-gargantilla',
      nombre: 'Gargantilla Eclipse',
      slug: { _type: 'slug', current: 'gargantilla-eclipse' },
      precio: 85000,
      descripcion: 'Pieza forjada al rojo vivo, con bordes fundidos naturales de 12 horas de curado.',
      disponible: true,
      esEdicionLimitada: true,
    },
    {
      _type: 'producto',
      _id: 'prod-luz-fundida-anillo-magma',
      nombre: 'Anillo Magma',
      slug: { _type: 'slug', current: 'anillo-magma' },
      precio: 45000,
      descripcion: 'Anillo moldeado con cristal ámbar oscuro incrustado.',
      disponible: true,
      esEdicionLimitada: false,
    },
    {
      _type: 'producto',
      _id: 'prod-luz-fundida-aros-fusion',
      nombre: 'Aros Fusión Bicolor',
      slug: { _type: 'slug', current: 'aros-fusion-bicolor' },
      precio: 32000,
      descripcion: 'Combinación de cristal transparente y obsidiana con base de plata 925.',
      disponible: true,
      esEdicionLimitada: false,
    },
    {
      _type: 'producto',
      _id: 'prod-luz-fundida-brazalete',
      nombre: 'Brazalete Aurelia',
      slug: { _type: 'slug', current: 'brazalete-aurelia' },
      precio: 52000,
      descripcion: 'Brazalete envolvente de forma libre.',
      disponible: true,
      esEdicionLimitada: false,
    },
    {
      _type: 'producto',
      _id: 'prod-luz-fundida-dije-sol',
      nombre: 'Dije Sol y Sombra',
      slug: { _type: 'slug', current: 'dije-sol-sombra' },
      precio: 29000,
      descripcion: 'Dije minimalista, ideal para cadenas ligeras.',
      disponible: true,
      esEdicionLimitada: false,
    }
  ]

  for (const prod of productosMock) {
    try {
      await client.createOrReplace(prod)
      console.log(`✅ Producto creado/reemplazado: ${prod.nombre}`)
    } catch (err) {
      console.error(`❌ Error al crear producto ${prod.nombre}:`, err)
    }
  }

  // 2. Crear la Colección Luz Fundida asociando estos productos con su tamanoGrilla
  console.log('\n🔄 Construyendo Colección: Luz Fundida...')
  
  const coleccion = {
    _type: 'coleccion',
    _id: 'col-luz-fundida',
    nombre: 'Luz Fundida',
    slug: { _type: 'slug', current: 'luz-fundida' },
    descripcion: 'Explorando el límite térmico del cristal. Piezas capturadas en el instante exacto de la joyería en vidrio.',
    descripcionLarga: 'Cada pieza de la colección Luz Fundida es el resultado de una cocción controlada de 24 horas. El vidrio alcanza su punto de saturación y comienza a fluir, creando patrones imposibles de replicar. Maestría de la Luz Molten. Joyería de autor diseñada y producida en el calor del horno.',
    productos: [
      {
        _key: crypto.randomUUID(),
        producto: { _type: 'reference', _ref: 'prod-luz-fundida-gargantilla' },
        tamanoGrilla: 'destacado', // Ocupa espacio ancho y alto
      },
      {
        _key: crypto.randomUUID(),
        producto: { _type: 'reference', _ref: 'prod-luz-fundida-anillo-magma' },
        tamanoGrilla: 'normal',
      },
      {
        _key: crypto.randomUUID(),
        producto: { _type: 'reference', _ref: 'prod-luz-fundida-aros-fusion' },
        tamanoGrilla: 'normal',
      },
      {
        _key: crypto.randomUUID(),
        producto: { _type: 'reference', _ref: 'prod-luz-fundida-brazalete' },
        tamanoGrilla: 'doble_ancho',
      },
      {
        _key: crypto.randomUUID(),
        producto: { _type: 'reference', _ref: 'prod-luz-fundida-dije-sol' },
        tamanoGrilla: 'normal',
      }
    ]
  }

  try {
    await client.createOrReplace(coleccion)
    console.log(`💎 Colección creada/reemplazada: ${coleccion.nombre} con ${coleccion.productos.length} items.`)
  } catch (err) {
    console.error(`❌ Error al crear colección ${coleccion.nombre}:`, err)
  }

  console.log('\n🎉 ¡Data semilla creada con éxito! Por favor ve al CMS de Sanity para adjuntar las imágenes (que este script asume vacías por ahora).')
}

seedData().catch(console.error)

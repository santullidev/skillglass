/* eslint-disable */
import fs from 'fs';
const { createClient } = require('@sanity/client')
const crypto = require('crypto')

// Loading environment variables for standard Node usage
const projectId = 'obhj76tx' 
const dataset = 'production'
const token = 'sksRyF8XWVJRLSJO2lyQRi8cRD4naxONSi4uowTRzdooKO37KnbMvd6yp7vo8IB8zuPN5ni2be3RaQOqJwV5eX3SCsdCobAG0AYAZeD2G3NEEYXVOEZrgnSFxvFmHrwnHpGvkRkQMk8nE1aONSvg9W1qFkbw8Xb1bHA7aWhkNxc2i9W2TEA8'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const seedData = async () => {
  console.log('🔄 Iniciando sembrado (JS)...')

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
      console.log(`✅ Producto: ${prod.nombre}`)
    } catch (err) {
      console.error(`❌ Error en ${prod.nombre}:`, err.message)
    }
  }

  const coleccion = {
    _type: 'coleccion',
    _id: 'col-luz-fundida',
    nombre: 'Luz Fundida',
    slug: { _type: 'slug', current: 'luz-fundida' },
    descripcion: 'Explorando el límite térmico del cristal. Piezas capturadas en el instante exacto de la vitrofusión.',
    descripcionLarga: 'Cada pieza de la colección Luz Fundida es el resultado de una cocción controlada de 24 horas.',
    productos: [
      {
        _key: crypto.randomUUID(),
        producto: { _type: 'reference', _ref: 'prod-luz-fundida-gargantilla' },
        tamanoGrilla: 'destacado',
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
    console.log(`💎 Colección: ${coleccion.nombre} creada.`)
  } catch (err) {
    console.error(`❌ Error en colección:`, err.message)
  }
}

seedData()

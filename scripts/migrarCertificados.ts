import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Cargar variables de entorno locales si existen
dotenv.config()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3l39wnt2', // Reemplazamos si está pero con fallback
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN, // token con permisos de escritura
  apiVersion: '2024-01-01',
  useCdn: false,
})

function generateCertificateNumber(): string {
  return Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
}

async function migrate() {
  if (!process.env.SANITY_API_TOKEN) {
    console.warn("⚠️ ADVERTENCIA: SANITY_API_TOKEN no está definido en tu .env local. No podrás escribir certificados en producción.")
    return
  }

  const productos = await client.fetch(
    `*[_type == "producto" && !defined(numeroCertificado)]{ _id, nombre }`
  )
  console.log(`Productos sin certificado: ${productos.length}`)

  const usedNumbers = new Set<string>()

  for (const producto of productos) {
    let num: string
    do { num = generateCertificateNumber() } while (usedNumbers.has(num))
    usedNumbers.add(num)
    await client.patch(producto._id).set({ numeroCertificado: num }).commit()
    console.log(`✅ ${producto.nombre} → № ${num}`)
  }
  console.log('Migración completa.')
}

migrate()

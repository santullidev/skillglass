/**
 * lib/sanity.ts
 *
 * Clientes de Sanity para uso EXCLUSIVO del servidor.
 *
 * `backendClient` lleva el token de escritura, así que este módulo está marcado
 * como `server-only`: si algún componente con 'use client' lo importa, el build
 * falla con un error claro en vez de arrastrarlo silenciosamente al bundle.
 *
 * Para mostrar imágenes desde el navegador, importar `urlFor` de
 * `lib/sanity-image.ts`, que no tiene credenciales.
 */

import 'server-only'

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'obhj76tx'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

/** Lectura de contenido público (productos, colecciones, settings). */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

/** Escritura desde el webhook: crea pedidos y marca piezas como vendidas. */
export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Reexportado por comodidad para los componentes de servidor, que ya importan
// de este módulo. Los de cliente deben usar '@/lib/sanity-image'.
export { urlFor } from './sanity-image'

/**
 * lib/sanity-image.ts
 *
 * Construcción de URLs de imágenes de Sanity. Es lo ÚNICO de Sanity que puede
 * viajar al navegador.
 *
 * Vive separado de `lib/sanity.ts` a propósito: ese módulo crea el cliente con
 * el token de escritura y está marcado como `server-only`. Antes ambos
 * convivían en el mismo archivo, así que cualquier componente de cliente que
 * quisiera mostrar una imagen arrastraba el cliente de escritura al bundle.
 * El valor del token nunca se filtró —Next sólo inyecta las `NEXT_PUBLIC_*`—
 * pero alcanzaba con que alguien renombrara la variable para exponerlo.
 *
 * Acá no hay credenciales: sólo el projectId y el dataset, que son públicos y
 * viajan igual en las URLs de las imágenes.
 */

import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'obhj76tx',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
})

export const urlFor = (source: SanityImageSource) => builder.image(source)

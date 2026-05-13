import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { PRODUCTOS_QUERY } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.skilglass.com.ar'

  // Consultar todos los productos disponibles en Sanity
  const productos = await client.fetch(PRODUCTOS_QUERY)

  const productUrls = productos.map((producto: any) => ({
    url: `${baseUrl}/productos/${encodeURI(producto.slug)}`,
    lastModified: new Date(producto._updatedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/estudio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soporte`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...productUrls,
  ]
}

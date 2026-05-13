import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.skilglass.com.ar'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/pago/exitoso', '/pago/pendiente', '/pago/fallo'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

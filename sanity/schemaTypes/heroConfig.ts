import { defineField, defineType } from 'sanity'

export const heroConfigSchema = defineType({
  name: 'heroConfig',
  title: '1 · Portada (Hero)',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'fotosPortada',
      title: 'Fotos o Videos de fondo',
      type: 'array',
      of: [
        { 
          type: 'image', 
          options: { hotspot: true },
          title: 'Imagen' 
        },
        { 
          type: 'file', 
          options: { accept: 'video/mp4,video/webm' },
          title: 'Video (Max 10MB)',
          validation: (Rule) => Rule.custom(async (value, context) => {
            if (!value?.asset?._ref) return true
            const client = context.getClient({ apiVersion: '2023-01-01' })
            const asset = await client.getDocument(value.asset._ref)
            if (asset && asset.size > 10 * 1024 * 1024) { // 10MB
              return '🛑 El video pesa más de 10MB. Comprimilo antes de subirlo.'
            }
            return true
          })
        }
      ],
      description: '📸 Agregá fotos o videos cortos para el carrusel. Si subís video, que pese menos de 10MB.',
    }),
    defineField({
      name: 'tituloHero',
      title: 'Título principal',
      type: 'string',
      description: 'El texto grande que aparece en el centro.',
    }),
    defineField({
      name: 'subtituloHero',
      title: 'Subtítulo',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'metadata',
      title: '🔖 Datos técnicos sobre la pieza',
      type: 'object',
      fields: [
        { name: 'piezaId', title: 'Código de Pieza', type: 'string' },
        { name: 'referencia', title: 'Referencia técnica', type: 'string' },
      ],
    }),
    defineField({
      name: 'ctaTexto',
      title: 'Texto del botón',
      type: 'string',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Enlace del botón',
      type: 'string',
    }),
  ],
})

import { defineField, defineType } from 'sanity'

export const heroConfigSchema = defineType({
  name: 'heroConfig',
  title: '1 · Portada (Hero)',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'fotosPortada',
      title: 'Fotos de fondo',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: '📸 Agregá una o varias fotos para el carrusel.',
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

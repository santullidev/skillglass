import { defineField, defineType } from 'sanity'

export const diarioTallerSchema = defineType({
  name: 'diarioTaller',
  title: 'Diario del Taller',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'config', title: '⚙️ Configuración', default: true },
    { name: 'posts', title: '📸 Posts' },
  ],
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título de la sección',
      type: 'string',
      group: 'config',
      initialValue: 'Diario del Taller',
      description: 'El encabezado que aparece arriba del feed.',
    }),
    defineField({
      name: 'handle',
      title: 'Handle de Instagram',
      type: 'string',
      group: 'config',
      initialValue: '@skilglass',
      description: 'El usuario de Instagram. Ej: @skilglass',
    }),
    defineField({
      name: 'urlInstagram',
      title: 'URL de Instagram',
      type: 'url',
      group: 'config',
      description: 'Link del botón "Seguinos". Ej: https://instagram.com/skilglass',
    }),
    defineField({
      name: 'activo',
      title: '¿Mostrar esta sección en el home?',
      type: 'boolean',
      group: 'config',
      initialValue: true,
    }),
    defineField({
      name: 'posts',
      title: 'Posts del Diario',
      type: 'array',
      group: 'posts',
      description: '📸 Subí fotos y videos del taller. Podés reordenarlos arrastrando.',
      of: [
        {
          type: 'object',
          title: 'Post',
          preview: {
            select: {
              title: 'descripcion',
              media: 'imagen',
            },
            prepare({ title, media }) {
              return {
                title: title || 'Sin descripción',
                media,
              }
            },
          },
          fields: [
            {
              name: 'tipo',
              title: 'Tipo de contenido',
              type: 'string',
              options: {
                list: [
                  { title: '📷 Imagen', value: 'imagen' },
                  { title: '🎬 Video', value: 'video' },
                ],
                layout: 'radio',
              },
              initialValue: 'imagen',
              validation: (R) => R.required(),
            },
            {
              name: 'imagen',
              title: 'Imagen',
              type: 'image',
              options: { hotspot: true },
              description: 'Usá imágenes cuadradas (1:1) para mejor resultado.',
              hidden: ({ parent }) => parent?.tipo === 'video',
            },
            {
              name: 'video',
              title: 'Video (archivo)',
              type: 'file',
              options: { accept: 'video/*' },
              description: 'Sube un video mp4. Máximo recomendado: 15MB.',
              hidden: ({ parent }) => parent?.tipo !== 'video',
              validation: (Rule) => Rule.custom(async (value, context) => {
                if (!value?.asset?._ref) return true
                const client = context.getClient({ apiVersion: '2023-01-01' })
                const asset = await client.getDocument(value.asset._ref)
                if (asset && asset.size > 15 * 1024 * 1024) { // 15MB
                  return '🛑 El video pesa más de 15MB. Comprimilo antes de subirlo para no afectar la velocidad web.'
                }
                return true
              })
            },
            {
              name: 'descripcion',
              title: 'Descripción / Caption',
              type: 'text',
              rows: 2,
              description: 'Texto opcional que aparece al hacer hover.',
            },
            {
              name: 'linkPost',
              title: 'Link al post (opcional)',
              type: 'url',
              description: 'Si querés que abra el post de Instagram al hacer click.',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: '📸 Diario del Taller' }
    },
  },
})

import { defineField, defineType } from 'sanity'

export const procesoSectionSchema = defineType({
  name: 'procesoSectionConfig',
  title: '6 · Proceso de Creación',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'activo',
      title: 'Activar sección',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'imagen',
      title: 'Imagen de fondo/lateral',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'etiqueta',
      title: 'Etiqueta superior',
      type: 'string',
      initialValue: 'LA TÉCNICA',
    }),
    defineField({
      name: 'tituloProceso',
      title: 'Título de la sección',
      type: 'string',
      initialValue: 'La Tensión de la Llama',
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción general',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'pasosProceso',
      title: 'Pasos o Pilares (Max 4)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'titulo', title: 'Título del paso', type: 'string' },
            { name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 },
          ],
        },
      ],
      validation: (Rule) => Rule.max(4),
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

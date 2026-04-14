import { defineField, defineType } from 'sanity'

export const alquimiaSectionSchema = defineType({
  name: 'alquimiaSectionConfig',
  title: '3 · Pieza Destacada (Alquimia)',
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
      name: 'etiqueta',
      title: 'Etiqueta superior',
      type: 'string',
      initialValue: 'CURACIÓN TÉCNICA',
    }),
    defineField({
      name: 'producto',
      title: 'Producto destacada',
      type: 'reference',
      to: [{ type: 'producto' }],
    }),
    defineField({
      name: 'specs',
      title: 'Ficha Técnica (Specs)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Etiqueta', type: 'string' },
            { name: 'valor', title: 'Valor', type: 'string' },
          ],
        },
      ],
    }),
  ],
})

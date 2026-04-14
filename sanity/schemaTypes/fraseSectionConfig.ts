import { defineField, defineType } from 'sanity'

export const fraseSectionSchema = defineType({
  name: 'fraseSectionConfig',
  title: '4 · Frase Editorial',
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
      name: 'fraseEditorial',
      title: 'Frase',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'autorFrase',
      title: 'Autor / Firma',
      type: 'string',
      initialValue: 'SKILGLASS',
    }),
  ],
})

import { defineField, defineType } from 'sanity'

export const capsulasSectionSchema = defineType({
  name: 'capsulasSectionConfig',
  title: '2 · Cápsulas (Colecciones)',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'tituloSeccionColecciones',
      title: 'Título de la sección',
      type: 'string',
      initialValue: 'Series Conceptuales',
    }),
    defineField({
      name: 'coleccionesDestacadas',
      title: 'Cápsulas a mostrar',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'coleccion' }] }],
    }),
  ],
})

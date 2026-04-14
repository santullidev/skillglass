import { defineField, defineType } from 'sanity'

export const productosSectionSchema = defineType({
  name: 'productosSectionConfig',
  title: '5 · Productos Destacados',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'tituloSeccionProductos',
      title: 'Título de la sección',
      type: 'string',
      initialValue: 'Piezas Destacadas',
    }),
    defineField({
      name: 'productosDestacados',
      title: 'Productos a mostrar',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'producto' }] }],
    }),
  ],
})

import { defineField, defineType } from 'sanity'

export const productSchema = defineType({
  name: 'producto',
  title: 'Producto',
  type: 'document',
  fields: [
    defineField({
      name: 'nombre',
      title: 'Nombre del producto',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'nombre', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'precio',
      title: 'Precio (ARS)',
      type: 'number',
    }),
    defineField({
      name: 'imagenes',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'disponible',
      title: '¿Disponible?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'esEdicionLimitada',
      title: '¿Es pieza de colección / edición limitada?',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
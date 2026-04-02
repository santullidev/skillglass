import { defineField, defineType } from 'sanity'

export const collectionSchema = defineType({
  name: 'coleccion',
  title: 'Colección',
  type: 'document',
  fields: [
    defineField({
      name: 'nombre',
      title: 'Nombre de la Colección',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'nombre',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción Corta',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'descripcionLarga',
      title: 'Descripción Editorial (Larga)',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'imagenes',
      title: 'Imágenes (Carousel)',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        layout: 'grid',
      },
      description: 'La primera imagen será la portada.',
    }),
    defineField({
      name: 'productos',
      title: 'Productos en esta Colección (Bento Grid)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'producto',
              title: 'Producto',
              type: 'reference',
              to: [{ type: 'producto' }],
            },
            {
              name: 'tamanoGrilla',
              title: 'Tamaño en la Grilla',
              type: 'string',
              options: {
                list: [
                  { title: 'Normal (1 Columna)', value: 'normal' },
                  { title: 'Doble Ancho (2 Columnas)', value: 'doble_ancho' },
                  { title: 'Doble Alto (2 Filas)', value: 'doble_alto' },
                  { title: 'Destacado (Doble Ancho y Alto)', value: 'destacado' },
                ],
              },
              initialValue: 'normal',
            },
          ],
          preview: {
            select: {
              title: 'producto.nombre',
              subtitle: 'tamanoGrilla',
              media: 'producto.imagenes.0',
            },
          },
        },
      ],
    }),
  ],
})

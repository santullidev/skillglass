import { defineField, defineType } from 'sanity'

export const productosSectionSchema = defineType({
  name: 'productosSectionConfig',
  title: '2 · Productos Destacados en Home',
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
      name: 'descripcion',
      title: 'Descripción (Texto debajo del título)',
      type: 'text',
      rows: 3,
      initialValue: 'Joyería que nace de la pura destreza térmica. Un catálogo donde el asombro artesanal se encuentra con la fluidez del cristal soplado a la flama.',
    }),
    defineField({
      name: 'ctaTexto',
      title: 'Texto del enlace (Ej: Catálogo Flameworking)',
      type: 'string',
      initialValue: 'Catálogo Flameworking',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Enlace (Ej: /productos)',
      type: 'string',
      initialValue: '/productos',
    }),
    defineField({
      name: 'productosDestacados',
      title: 'Productos a mostrar en el Home',
      type: 'array',
      description: '👆 Elegí cuáles piezas aparecen en la sección "Sala de Exposición" del Home. Si no elegís ninguna, se muestran todas automáticamente. Para crear o editar piezas, andá a "Piezas (Productos)" en el menú lateral.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'producto' }],
          options: {
            filter: 'disponible == true',
            disableNew: false,
          },
        }
      ],
    }),
  ],
})

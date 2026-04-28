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

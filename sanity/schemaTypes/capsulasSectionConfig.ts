import { defineField, defineType } from 'sanity'

export const capsulasSectionSchema = defineType({
  name: 'capsulasSectionConfig',
  title: '5 · Cápsulas en Home',
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
      title: 'Cápsulas a mostrar en el Home',
      type: 'array',
      description: '👆 Elegí cuáles cápsulas aparecen en la sección del Home. Podés reordenarlas arrastrando. Para crear una cápsula nueva, andá a "Cápsulas (Catálogo completo)" en el menú lateral.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'coleccion' }],
          options: {
            filter: 'defined(slug.current)',
            disableNew: false,
          },
        }
      ],
    }),
  ],
})

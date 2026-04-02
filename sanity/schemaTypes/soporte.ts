import { defineField, defineType } from 'sanity'

export const soporteSchema = defineType({
  name: 'soporte',
  title: 'Página de Soporte',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título de la Página',
      type: 'string',
      initialValue: '¿Cómo podemos ayudarte?',
    }),
    defineField({
      name: 'subtitulo',
      title: 'Subtítulo / Introducción',
      type: 'text',
      initialValue: 'En SKILGLASS cada pieza es esculpida a mano en el fuego. Nuestro soporte es personal y directo.',
    }),
    defineField({
      name: 'secciones',
      title: 'Secciones Flexibles',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'seccion',
          title: 'Sección',
          fields: [
            { name: 'titulo', type: 'string', title: 'Título de Sección' },
            { 
              name: 'contenido', 
              type: 'array', 
              title: 'Contenido',
              of: [{ type: 'block' }] // Portable Text
            },
            { 
              name: 'id', 
              type: 'string', 
              title: 'ID para Enlace (Opcional)',
              description: 'Ej: envios, cuidados, devoluciones. Útil para anclas.'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'faqs',
      title: 'Preguntas Frecuentes',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faq',
          title: 'Pregunta',
          fields: [
            { name: 'pregunta', type: 'string', title: 'Pregunta' },
            { name: 'respuesta', type: 'text', title: 'Respuesta' }
          ]
        }
      ]
    }),
  ],
})

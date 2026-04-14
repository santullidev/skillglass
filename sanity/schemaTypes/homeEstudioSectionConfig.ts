import { defineField, defineType } from 'sanity'

export const homeEstudioSectionSchema = defineType({
  name: 'homeEstudioSectionConfig',
  title: '7 · El Estudio (Acceso)',
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
      name: 'titulo',
      title: 'Título de la invitación',
      type: 'string',
      initialValue: 'El Alma del Vidrio',
    }),
    defineField({
      name: 'descripcion',
      title: 'Breve descripción',
      type: 'text',
      rows: 3,
      initialValue: 'Adéntrate en el proceso donde el fuego y la paciencia se encuentran. Conoce nuestro taller y la filosofía detrás de cada pieza única.',
    }),
    defineField({
      name: 'imagen',
      title: 'Imagen de fondo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'ctaTexto',
      title: 'Texto del botón',
      type: 'string',
      initialValue: 'Explorar el Estudio',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Enlace del botón',
      type: 'string',
      initialValue: '/estudio',
      description: 'Por defecto redirige a /estudio',
    }),
  ],
})

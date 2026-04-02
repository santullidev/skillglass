import { defineField, defineType } from 'sanity'

export const settingsSchema = defineType({
  name: 'settings',
  title: 'Configuraciones Globales',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email de Contacto',
      type: 'string',
      description: 'Este es el email que aparecerá en el pie de página y página de contacto.',
    }),
    defineField({
      name: 'telefono',
      title: 'Teléfono / WhatsApp',
      type: 'string',
      description: 'Ingresa el número con código de país (ej: +54911...) para el botón de WhatsApp.',
    }),
    defineField({
      name: 'direccion',
      title: 'Dirección del Taller (Futuro)',
      type: 'string',
      description: 'Deja este campo vacío por ahora si no quieres mostrarlo.',
    }),
    defineField({
      name: 'instagram',
      title: 'URL de Instagram',
      type: 'url',
      description: 'Link completo al perfil de Instagram (ej: https://instagram.com/skilglass).',
    }),
  ],
})

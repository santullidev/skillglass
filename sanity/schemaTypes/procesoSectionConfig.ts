import React from 'react'
import { defineField, defineType } from 'sanity'

export const procesoSectionSchema = defineType({
  name: 'procesoSectionConfig',
  title: '6 · Proceso de Creación',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fieldsets: [
    { name: 'paso1', title: 'Pilar / Paso 1', options: { collapsible: true, collapsed: false } },
    { name: 'paso2', title: 'Pilar / Paso 2', options: { collapsible: true, collapsed: false } },
    { name: 'paso3', title: 'Pilar / Paso 3', options: { collapsible: true, collapsed: false } },
    { name: 'paso4', title: 'Pilar / Paso 4', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: 'activo',
      title: 'Activar sección',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'imagen',
      title: 'Imagen de fondo/lateral',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'etiqueta',
      title: 'Etiqueta superior',
      type: 'string',
      initialValue: 'LA TÉCNICA',
    }),
    defineField({
      name: 'tituloProceso',
      title: 'Título de la sección',
      type: 'string',
      initialValue: 'La Tensión de la Llama',
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción general',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'paso1Titulo', title: 'Título', type: 'string', fieldset: 'paso1' }),
    defineField({ name: 'paso1Descripcion', title: 'Descripción', type: 'text', rows: 2, fieldset: 'paso1' }),

    defineField({ name: 'paso2Titulo', title: 'Título', type: 'string', fieldset: 'paso2' }),
    defineField({ name: 'paso2Descripcion', title: 'Descripción', type: 'text', rows: 2, fieldset: 'paso2' }),

    defineField({ name: 'paso3Titulo', title: 'Título', type: 'string', fieldset: 'paso3' }),
    defineField({ name: 'paso3Descripcion', title: 'Descripción', type: 'text', rows: 2, fieldset: 'paso3' }),

    defineField({ name: 'paso4Titulo', title: 'Título', type: 'string', fieldset: 'paso4' }),
    defineField({ name: 'paso4Descripcion', title: 'Descripción', type: 'text', rows: 2, fieldset: 'paso4' }),
    defineField({
      name: 'ctaTexto',
      title: 'Texto del botón',
      type: 'string',
      initialValue: 'VER LAS CÁPSULAS',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Enlace del botón',
      type: 'string',
      initialValue: '/colecciones',
    }),
  ],
})

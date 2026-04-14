import { defineField, defineType } from 'sanity'

export const collectionSchema = defineType({
  name: 'coleccion',
  title: 'Cápsula',
  type: 'document',
  groups: [
    { name: 'info', title: '📝  Información', default: true },
    { name: 'galeria', title: '📸  Galería de imágenes' },
    { name: 'productos', title: '💎  Piezas incluidas' },
  ],
  fields: [
    // ─── INFO ───────────────────────────────────────────────────────────
    defineField({
      name: 'nombre',
      title: 'Nombre de la cápsula',
      type: 'string',
      group: 'info',
      description: '✏️ El nombre que aparecerá como título de la cápsula. Ej: "Cápsula Elementos".',
      placeholder: 'Cápsula Elementos',
      validation: (rule) =>
        rule.required().error('El nombre de la cápsula es obligatorio.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL de la cápsula (generada automáticamente)',
      type: 'slug',
      group: 'info',
      options: { source: 'nombre', maxLength: 96 },
      description: '🔗 Se genera sola desde el nombre. Hacé clic en "Generate" y no hace falta tocarla más.',
      validation: (rule) =>
        rule.required().error('Generá la URL haciendo clic en "Generate".'),
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción corta',
      type: 'text',
      rows: 3,
      group: 'info',
      description: '📝 Frase breve que aparece debajo del nombre en la vista previa de la cápsula. Máximo 2-3 oraciones.',
      placeholder: 'Una exploración de la luz a través del cristal fundido...',
    }),
    defineField({
      name: 'descripcionLarga',
      title: 'Texto editorial (descripción larga)',
      type: 'text',
      rows: 6,
      group: 'info',
      description: '🖊️ Texto más extenso que aparece dentro de la página de la cápsula. Podés contar la historia detrás de esta serie, la inspiración, los materiales usados, etc.',
      placeholder: 'Esta cápsula nació de la observación del cielo nocturno sobre el taller...',
    }),

    // ─── IMÁGENES ───────────────────────────────────────────────────────
    defineField({
      name: 'imagenes',
      title: 'Fotos de la cápsula',
      type: 'array',
      group: 'galeria',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
      description: '📸 La primera imagen es la portada de la cápsula. Podés agregar varias fotos que se mostrarán como carrusel. Arrastrá para reordenar.',
    }),

    // ─── PRODUCTOS ──────────────────────────────────────────────────────
    defineField({
      name: 'productos',
      title: 'Piezas que forman esta cápsula',
      type: 'array',
      group: 'productos',
      description: '💎 Elegí qué piezas pertenecen a esta cápsula. También podés controlar qué tan grande se muestra cada una en la grilla del sitio (normal, doble ancho, etc.).',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'producto',
              title: 'Pieza',
              type: 'reference',
              to: [{ type: 'producto' }],
              description: 'Elegí la pieza del catálogo.',
            },
            {
              name: 'tamanoGrilla',
              title: 'Tamaño en la grilla del sitio',
              type: 'string',
              description: '📐 Controla cuánto espacio ocupa esta pieza en el diseño de la colección.',
              options: {
                list: [
                  { title: '◻️  Normal (ocupa 1 casilla)', value: 'normal' },
                  { title: '◼️  Doble ancho (ocupa 2 columnas)', value: 'doble_ancho' },
                  { title: '🔲  Doble alto (ocupa 2 filas)', value: 'doble_alto' },
                  { title: '⭐  Destacado (grande, doble ancho y alto)', value: 'destacado' },
                ],
                layout: 'radio',
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
            prepare({ title, subtitle, media }) {
              const sizes: Record<string, string> = {
                normal: 'Normal',
                doble_ancho: 'Doble ancho',
                doble_alto: 'Doble alto',
                destacado: '⭐ Destacado',
              }
              return {
                title: title || 'Pieza sin nombre',
                subtitle: sizes[subtitle] || subtitle,
                media,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'nombre',
      subtitle: 'descripcion',
      media: 'imagenes',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Cápsula sin nombre',
        subtitle: subtitle || 'Sin descripción',
        media,
      }
    },
  },
})

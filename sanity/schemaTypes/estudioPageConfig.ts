import { defineField, defineType } from 'sanity'

export const estudioPageSchema = defineType({
  name: 'estudioPageConfig',
  title: 'Página El Estudio',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'hero', title: 'Portada (Hero)' },
    { name: 'manifiesto', title: 'Manifiesto' },
    { name: 'proceso', title: 'Fases Técnicas' },
    { name: 'cta', title: 'Llamado a la acción' }
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroLabel',
      title: 'Etiqueta superior',
      type: 'string',
      group: 'hero',
      initialValue: 'Adentrándose en el Fuego',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Título principal',
      type: 'string',
      group: 'hero',
      initialValue: 'El Pulso & la Flama',
      description: 'El texto "la Flama" se mostrará en cursiva y con el "&" decorativo. Usa el formato sugerido.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Imagen / Video de Fondo (Opcional)',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
      description: 'Imagen de fondo para la cabecera. Si no subís nada, se mostrará el diseño por defecto.',
    }),

    // Manifiesto
    defineField({
      name: 'manifiestoTitle',
      title: 'Título del Manifiesto',
      type: 'string',
      group: 'manifiesto',
      initialValue: 'Forjando la inestabilidad absoluta.',
    }),
    defineField({
      name: 'manifiestoCita',
      title: 'Cita Principal (Itálica)',
      type: 'text',
      rows: 3,
      group: 'manifiesto',
      initialValue: '“No somos una fábrica. No ensamblamos piezas frías. Cada gota de cristal es llevada a su límite térmico, donde deja de ser un sólido predecible para convertirse en una extensión de nuestra respiración.”',
    }),
    defineField({
      name: 'manifiestoTexto',
      title: 'Texto Explicativo',
      type: 'text',
      rows: 4,
      group: 'manifiesto',
      initialValue: 'El soplado a la flama o lampworking es una coreografía de precisión. Una milésima de segundo extra en el fuego a 1000°C altera para siempre el centro de gravedad de una joya. En nuestro estudio, celebramos esa imperfección controlada. Cada anillo, pendiente o broche refleja la tensión innegable entre el calor extremo, el pulso humano y la repentina solidificación en el aire.',
    }),

    // Proceso
    defineField({
      name: 'fases',
      title: 'Fases Técnicas',
      type: 'array',
      group: 'proceso',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'etiqueta', title: 'Etiqueta (Ej: Fase I)', type: 'string' },
            { name: 'titulo', title: 'Título', type: 'string' },
            { name: 'descripcion', title: 'Descripción', type: 'text', rows: 3 },
            { 
              name: 'imagen', 
              title: 'Imagen Ilustrativa', 
              type: 'image', 
              options: { hotspot: true },
              description: '✂️ Hacé clic en la imagen y luego en "Edit" para abrir el CROPER. Podés elegir qué parte de la foto se ve (Hotspot) y cómo se recorta (Crop) para que siempre quede perfecta en la grilla.'
            }
          ]
        }
      ],
      description: 'Agrega las fases del proceso. El diseño está optimizado para 3 fases y sus imágenes.',
    }),
    defineField({
      name: 'texturaFinalTexto',
      title: 'Texto del Bloque Final (Grid)',
      type: 'string',
      group: 'proceso',
      initialValue: 'Ciencia y\nSensibilidad.',
      description: 'Usa \\n o da Enter para separar en líneas si es necesario.',
    }),

    // CTA
    defineField({
      name: 'ctaEtiqueta',
      title: 'Etiqueta Superior CTA',
      type: 'string',
      group: 'cta',
      initialValue: 'El resultado final',
    }),
    defineField({
      name: 'ctaTitulo',
      title: 'Título CTA',
      type: 'string',
      group: 'cta',
      initialValue: 'Explora las piezas\nnacidas del fuego.',
    }),
    defineField({
      name: 'ctaTextoBoton',
      title: 'Texto del Botón',
      type: 'string',
      group: 'cta',
      initialValue: 'Ingresar al Catálogo',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Link del Botón',
      type: 'string',
      group: 'cta',
      initialValue: '/colecciones',
    }),
  ],
})

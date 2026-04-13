import { defineField, defineType } from 'sanity'

export const productoConfigSchema = defineType({
  name: 'productoConfig',
  title: 'Página de Producto',
  type: 'document',
  groups: [
    { name: 'general', title: '✨  Textos Generales', default: true },
    { name: 'tecnico', title: '📐  Especificaciones' },
    { name: 'certificado', title: '📜  Certificado e Iconos' },
    { name: 'garantias', title: '🤝  Garantías' },
  ],
  fields: [
    // ─── GENERAL ────────────────────────────────────────────────────────
    defineField({
      name: 'breadcrumbText',
      title: 'Texto del localizador (Breadcrumb)',
      type: 'string',
      group: 'general',
      description: 'El texto que aparece en la parte de arriba. Ejemplo: "Serie Limitada" o "Catálogo General".',
      placeholder: 'Serie Limitada',
      initialValue: 'Serie Limitada'
    }),
    defineField({
      name: 'galleryHelpText',
      title: 'Texto de ayuda en Galería',
      type: 'string',
      group: 'general',
      description: 'El indicador debajo de las imágenes para que sepan interactuar.',
      placeholder: 'Zoom disponible • Arrastrar para rotar',
      initialValue: 'Zoom disponible • Arrastrar para rotar'
    }),
    defineField({
      name: 'tagText',
      title: 'Etiqueta Especial (Si es Edición Limitada)',
      type: 'string',
      group: 'general',
      description: 'La etiqueta que aparece por encima del nombre del producto si marcaste "Edición Limitada" en el producto.',
      placeholder: 'Pieza de Colección / Edición Limitada',
      initialValue: 'Pieza de Colección / Edición Limitada'
    }),
    defineField({
      name: 'outOfStockText',
      title: 'Texto de Producto Agotado',
      type: 'string',
      group: 'general',
      description: 'Qué dice la caja del botón si no hay stock.',
      placeholder: 'Pieza no disponible',
      initialValue: 'Pieza no disponible'
    }),
    defineField({
      name: 'fraseFinal',
      title: 'Frase Editorial Inferior',
      type: 'text',
      rows: 2,
      group: 'general',
      description: 'La frase final grande antes del final de la página.',
      placeholder: 'El cristal no olvida. La curva de temperatura que le dimos ayer dictará cómo refracta la luz hoy.',
      initialValue: 'El cristal no olvida. La curva de temperatura que le dimos ayer dictará cómo refracta la luz hoy.'
    }),

    // ─── ESPECIFICACIONES ───────────────────────────────────────────────
    defineField({
      name: 'tecnicaGeneral',
      title: 'Técnica Principal',
      type: 'string',
      group: 'tecnico',
      placeholder: 'Fusión 820°C',
      initialValue: 'Fusión 820°C'
    }),
    defineField({
      name: 'materialGeneral',
      title: 'Materiales base',
      type: 'string',
      group: 'tecnico',
      placeholder: 'Cristal Spectrum / Plata 925',
      initialValue: 'Cristal Spectrum / Plata 925'
    }),
    defineField({
      name: 'envioGeneral',
      title: 'Nombre del método de Envío',
      type: 'string',
      group: 'tecnico',
      placeholder: 'Eco-Global Express',
      initialValue: 'Eco-Global Express'
    }),

    // ─── CERTIFICADO Y PROCESO ─────────────────────────────────────────
    defineField({
      name: 'certificadoTitulo',
      title: 'Título del Certificado de Autenticidad',
      type: 'string',
      group: 'certificado',
      placeholder: 'Pieza Única e Irrepetible',
      initialValue: 'Pieza Única e Irrepetible'
    }),
    defineField({
      name: 'certificadoTexto',
      title: 'Descripción del Certificado',
      type: 'text',
      rows: 3,
      group: 'certificado',
      placeholder: 'Esta obra ha sido esculpida mediante transformación térmica directa...',
      initialValue: 'Esta obra ha sido esculpida mediante transformación térmica directa. Debido a la naturaleza orgánica del cristal fundido, las tensiones moleculares y la gravedad han dictado una forma final que es técnicamente imposible de replicar con exactitud.'
    }),
    defineField({
      name: 'firmaEstudio',
      title: 'Sello / Firma en Certificado',
      type: 'string',
      group: 'certificado',
      placeholder: 'Estudio Skilglass Ar',
      initialValue: 'Estudio Skilglass Ar'
    }),

    // ─── ICONO FLAMA (SOPLADO) ─────────────────────────────────────────
    defineField({
      name: 'procesoIconoTitulo',
      title: 'Título de la pastilla "Soplado a la Flama"',
      type: 'string',
      group: 'certificado',
      placeholder: 'Soplado a la Flama',
      initialValue: 'Soplado a la Flama'
    }),
    defineField({
      name: 'procesoIconoTexto',
      title: 'Descripción de la pastilla',
      type: 'text',
      rows: 2,
      group: 'certificado',
      placeholder: 'Cristal esculpido directamente bajo la tensión térmica del soplete.',
      initialValue: 'Cristal esculpido directamente bajo la tensión térmica del soplete.'
    }),

    // ─── GARANTÍAS (TRUST BADGES) ───────────────────────────────────────
    defineField({
      name: 'garantias',
      title: 'Puntos de Confianza / Garantías',
      type: 'array',
      group: 'garantias',
      description: 'El listado de beneficios que avalan la pieza (ej: Packaging Artesanal, Certificado).',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'titulo',
              title: 'Título (en negrita)',
              type: 'string',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'descripcion',
              title: 'Descripción extendida',
              type: 'string',
              validation: (Rule) => Rule.required()
            }
          ]
        }
      ],
      initialValue: [
        {
          titulo: 'Certificado de Autenticidad',
          descripcion: 'Cada pieza se entrega con un certificado firmado a mano que garantiza su origen artesanal en nuestro estudio y su carácter de pieza única.'
        },
        {
          titulo: 'Packaging Artesanal',
          descripcion: 'Estuche de lino orgánico y caja rígida de diseño minimalista con sello de marca en relieve.'
        }
      ]
    }),
  ]
})

import { defineField, defineType } from 'sanity'

function generateCertificateNumber(): string {
  return Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
}

export const productSchema = defineType({
  name: 'producto',
  title: 'Producto',
  type: 'document',
  groups: [
    { name: 'info', title: '📝  Información básica', default: true },
    { name: 'imagenes', title: '📸  Fotos' },
    { name: 'visibilidad', title: '👁️  Visibilidad y estado' },
  ],
  fields: [
    // ─── INFORMACIÓN BÁSICA ─────────────────────────────────────────────
    defineField({
      name: 'nombre',
      title: 'Nombre de la pieza',
      type: 'string',
      group: 'info',
      description: '✏️ El nombre que verá el cliente en la tienda. Ejemplo: "Aros Supernova Cromados".',
      placeholder: 'Aros Supernova Cromados',
      validation: (Rule) =>
        Rule.required().error('El nombre es obligatorio para publicar la pieza.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL de la pieza (generada automáticamente)',
      type: 'slug',
      group: 'info',
      options: { source: 'nombre', maxLength: 96 },
      description: '🔗 Este es el link de la pieza en la tienda. Se genera sola cuando escribís el nombre. No hace falta tocarlo.',
      validation: (Rule) =>
        Rule.required().error('Hacé clic en "Generate" para generar la URL.'),
    }),
    defineField({
      name: 'numeroCertificado',
      title: '📜 Número de Certificado de Unicidad',
      type: 'string',
      group: 'info',
      description:
        '🔒 Código único irrepetible asignado a esta pieza. Se genera automáticamente al crear el producto. NO lo modifiques.',
      readOnly: true,
      initialValue: () => generateCertificateNumber(),
      validation: (Rule) =>
        Rule.required().error('El certificado es obligatorio.'),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoría',
      type: 'string',
      group: 'info',
      description: '🏷️ ¿En qué categoría entra esta pieza? Ayuda a filtrar en el catálogo.',
      options: {
        list: [
          { title: '👂  Pendiente', value: 'pendiente' },
          { title: '💎  Dijes', value: 'dijes' },
          { title: '💍  Anillos', value: 'anillos' },
          { title: '📦  Otros', value: 'otros' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'precio',
      title: 'Precio (en pesos argentinos)',
      type: 'number',
      group: 'info',
      description: '💰 Ingresá el precio en pesos, sin puntos ni comas. Ejemplo: 15000 (no $15.000).',
      placeholder: '15000',
      validation: (Rule) =>
        Rule.min(1).error('El precio debe ser mayor a cero.'),
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción de la pieza',
      type: 'text',
      rows: 5,
      group: 'info',
      description: '🖊️ Contá la historia de esta pieza. ¿Qué la hace única? ¿Qué material usaste? ¿Qué técnica? Este texto aparece en la página de cada producto.',
      placeholder: 'Esculpida bajo 820°C de llama directa, esta pieza...',
    }),
    defineField({
      name: 'peso',
      title: 'Peso en gramos',
      type: 'number',
      group: 'info',
      initialValue: 300,
      description: '⚖️ Peso aproximado en gramos (incluyendo packaging). Importante para calcular el costo de envío con Andreani. Valor por defecto: 300g.',
      validation: (Rule) => Rule.min(1).error('El peso debe ser mayor a 0.'),
    }),

    // ─── IMÁGENES ───────────────────────────────────────────────────────
    defineField({
      name: 'imagenes',
      title: 'Fotos de la pieza',
      type: 'array',
      group: 'imagenes',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: '📸 Subí una o varias fotos. La primera foto es la principal que verá el cliente en el catálogo. Podés reordenar arrastrando. Recomendado: fondo negro o neutro, buena luz.',
      validation: (Rule) =>
        Rule.min(1).warning('Se recomienda al menos una foto para publicar la pieza.'),
    }),

    // ─── VISIBILIDAD ────────────────────────────────────────────────────
    defineField({
      name: 'disponible',
      title: '¿La pieza está disponible para venta?',
      type: 'boolean',
      group: 'visibilidad',
      initialValue: true,
      description: '🟢 Si está activado, el cliente puede agregarla al carrito y comprarla. Si lo desactivás, aparecerá como "No disponible" en la tienda. Esto se actualiza automáticamente cuando se realiza una venta.',
    }),
  ],
  preview: {
    select: {
      title: 'nombre',
      subtitle: 'categoria',
      media: 'imagenes',
      disponible: 'disponible',
    },
    prepare({ title, subtitle, media, disponible }) {
      return {
        title: `${disponible ? '🟢' : '🔴'} ${title || 'Sin nombre'}`,
        subtitle: subtitle || 'Sin categoría',
        media: media?.[0] || media,
      }
    },
  },
})
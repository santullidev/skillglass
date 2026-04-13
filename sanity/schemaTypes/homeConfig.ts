import { defineField, defineType } from 'sanity'

export const homeConfigSchema = defineType({
  name: 'homeConfig',
  title: 'Configuración del Home',
  type: 'document',
  groups: [
    { name: 'hero', title: '🖼️  Portada (Hero)' },
    { name: 'colecciones', title: '🗂️  Cápsulas' },
    { name: 'alquimia', title: '💎  Pieza Destacada' },
    { name: 'frase', title: '💬  Frase Editorial' },
    { name: 'productos', title: '📦  Productos' },
    { name: 'proceso', title: '⚙️  Proceso de Creación' },
  ],
  fields: [
    // ─── HERO ───────────────────────────────────────────────────────────
    defineField({
      name: 'heroImages',
      title: 'Fotos de fondo',
      type: 'array',
      group: 'hero',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: '📸 Agregá una o varias fotos. Si subís más de una, se va a mostrar un carrusel que cambia solo cada 6 segundos.',
    }),
    defineField({
      name: 'tituloPrincipal',
      title: 'Título principal',
      type: 'string',
      group: 'hero',
      description: 'El texto grande que aparece en el centro. Podés usar dos líneas separando con un salto de línea.',
      placeholder: 'Maestría de la Luz Molten',
    }),
    defineField({
      name: 'subtituloHero',
      title: 'Subtítulo (debajo del título)',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'Una frase corta descriptiva. Aparece debajo del título principal.',
      placeholder: 'Explorando el límite térmico del cristal.',
    }),
    defineField({
      name: 'heroMetadata',
      title: '🔖 Datos técnicos sobre la foto',
      type: 'object',
      group: 'hero',
      description: 'Texto pequeño que aparece en la parte inferior de la foto. Sirve para dar identidad a la pieza fotografiada.',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'piezaId',
          title: 'Código de Pieza',
          type: 'string',
          description: 'Ej: NO. 042-BALTIC',
          placeholder: 'NO. 042-BALTIC',
        },
        {
          name: 'referencia',
          title: 'Referencia técnica',
          type: 'string',
          description: 'Ej: VITRO-REFRACT-01',
          placeholder: 'VITRO-REFRACT-01',
        },
      ],
    }),

    // ─── CÁPSULAS ────────────────────────────────────────────────────
    defineField({
      name: 'tituloColecciones',
      title: 'Título de la sección',
      type: 'string',
      group: 'colecciones',
      description: 'El encabezado de la sección de cápsulas en el home.',
      placeholder: 'Series Conceptuales',
    }),
    defineField({
      name: 'coleccionesDestacadas',
      title: 'Cápsulas a mostrar',
      type: 'array',
      group: 'colecciones',
      of: [{ type: 'reference', to: [{ type: 'coleccion' }] }],
      description: '🗂️ Elegí qué cápsulas van a aparecer en esta sección. Si no elegís ninguna, la sección no se muestra.',
    }),

    // ─── PIEZA DESTACADA (ALQUIMIA) ─────────────────────────────────────
    defineField({
      name: 'seccionAlquimia',
      title: '💎 Pieza Destacada — Editar contenido',
      type: 'object',
      group: 'alquimia',
      description: 'Esta sección muestra una pieza en grande con sus características técnicas a los costados.',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'activo',
          title: '¿Activar esta sección?',
          type: 'boolean',
          initialValue: true,
          description: 'Si lo desactivás, esta sección no se muestra en el sitio.',
        },
        {
          name: 'etiqueta',
          title: 'Etiqueta superior',
          type: 'string',
          description: 'Texto pequeño que aparece arriba del nombre. Ej: "CURACIÓN TÉCNICA" o "PIEZA DEL MES"',
          placeholder: 'CURACIÓN TÉCNICA',
        },
        {
          name: 'producto',
          title: 'Producto a destacar',
          type: 'reference',
          to: [{ type: 'producto' }],
          description: 'Elegí el producto que querés mostrar en grande.',
        },
        {
          name: 'specs',
          title: 'Fichas técnicas',
          type: 'array',
          description: '📋 Agregá datos técnicos que quieras mostrar. Ej: "MASA" → "114g", "TEMPERATURA" → "820°C"',
          of: [{
            type: 'object',
            title: 'Ficha técnica',
            preview: {
              select: { title: 'label', subtitle: 'valor' },
            },
            fields: [
              {
                name: 'label',
                title: 'Nombre del dato',
                type: 'string',
                description: 'Ej: MASA, TEMPERATURA, PROCESO',
                placeholder: 'TEMPERATURA',
              },
              {
                name: 'valor',
                title: 'Valor',
                type: 'string',
                description: 'Ej: 820°C, 114g, Joyería en vidrio',
                placeholder: '820°C',
              },
            ],
          }],
        },
      ],
    }),

    // ─── FRASE EDITORIAL ────────────────────────────────────────────────
    defineField({
      name: 'seccionFrase',
      title: '💬 Frase Editorial — Editar contenido',
      type: 'object',
      group: 'frase',
      description: 'Una cita o frase destacada que aparece entre secciones, en letras grandes en cursiva.',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'activo',
          title: '¿Activar esta sección?',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'frase',
          title: 'La frase o cita',
          type: 'text',
          rows: 4,
          description: 'Escribí la frase que querés destacar. Aparece en letras grandes en cursiva.',
          placeholder: 'Cada pieza es el resultado de una cocción controlada de 24 horas...',
        },
      ],
    }),

    // ─── PRODUCTOS ──────────────────────────────────────────────────────
    defineField({
      name: 'tituloPiezasDestacadas',
      title: 'Título de la sección',
      type: 'string',
      group: 'productos',
      description: 'El encabezado de la sección de productos en el home.',
      placeholder: 'Piezas Destacadas',
    }),
    defineField({
      name: 'productosDestacados',
      title: 'Productos a mostrar',
      type: 'array',
      group: 'productos',
      of: [{ type: 'reference', to: [{ type: 'producto' }] }],
      description: '📦 Elegí qué productos van a aparecer en esta sección. Si no elegís ninguno, se muestran todos automáticamente.',
    }),

    // ─── PROCESO ────────────────────────────────────────────────────────
    defineField({
      name: 'seccionProceso',
      title: '⚙️ Proceso de Creación — Editar contenido',
      type: 'object',
      group: 'proceso',
      description: 'Esta sección explica el proceso artesanal de creación, paso a paso.',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'activo',
          title: '¿Activar esta sección?',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'imagen',
          title: 'Imagen del mechero / soplete',
          type: 'image',
          options: { hotspot: true },
          description: '🖼️ Foto atmosférica que aparece a la izquierda. Ideal: la llama viva, el cristal fundiéndose en el soplete, o las manos trabajando.',
        },
        {
          name: 'etiqueta',
          title: 'Etiqueta superior',
          type: 'string',
          description: 'Texto pequeño encima del título. Ej: "NUESTRO MANIFIESTO" o "EL PROCESO"',
          placeholder: 'NUESTRO MANIFIESTO',
        },
        {
          name: 'titulo',
          title: 'Título principal',
          type: 'string',
          description: 'El enunciado grande y contundente de la sección.',
          placeholder: 'El Caos Controlado del Fuego',
        },
        {
          name: 'descripcion',
          title: 'Frase / Cita principal',
          type: 'text',
          rows: 3,
          description: 'Una frase corta y poderosa que resume la filosofía de la marca. Aparece debajo del título.',
          placeholder: 'Permitimos que el azar bai¶ con el control del vidrio...',
        },
        {
          name: 'pasos',
          title: 'Pasos del proceso',
          type: 'array',
          description: '📋 Cada paso aparece como una tarjeta. Podés agregar, editar o reordenar los pasos.',
          of: [{
            type: 'object',
            title: 'Paso',
            preview: {
              select: { title: 'titulo', subtitle: 'descripcion' },
            },
            fields: [
              {
                name: 'titulo',
                title: 'Nombre del paso',
                type: 'string',
                description: 'Ej: Corte y Diseño',
                placeholder: 'Corte y Diseño',
              },
              {
                name: 'descripcion',
                title: 'Descripción',
                type: 'text',
                rows: 2,
                description: 'Una o dos frases explicando este paso.',
              },
            ],
          }],
        },
        {
          name: 'features',
          title: 'Pilares de la marca',
          type: 'array',
          description: '⭐ Cuatro frases cortas que destacan los valores clave. Aparecen como tarjetas debajo del título.',
          of: [{
            type: 'object',
            title: 'Pilar',
            preview: {
              select: { title: 'titulo', subtitle: 'descripcion' },
            },
            fields: [
              {
                name: 'titulo',
                title: 'Título del pilar',
                type: 'string',
                placeholder: '820°C de Precisión',
              },
              {
                name: 'descripcion',
                title: 'Descripción corta',
                type: 'string',
                placeholder: 'Fusión térmica exacta para garantizar la integridad del cristal.',
              },
            ],
          }],
        },
        {
          name: 'ctaTexto',
          title: 'Texto del botón (CTA)',
          type: 'string',
          description: 'El texto del enlace al final. Ej: "Conocer el Estudio"',
          placeholder: 'Conocer más',
        },
        {
          name: 'ctaLink',
          title: 'Enlace del botón',
          type: 'string',
          description: 'URL a donde dirige el botón. Ej: /colecciones, o externo.',
          placeholder: '/colecciones',
        },
      ],
    }),
  ],
})

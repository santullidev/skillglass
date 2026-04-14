import { defineField, defineType } from 'sanity'

export const settingsSchema = defineType({
  name: 'settings',
  title: '⚙️  Configuración General',
  type: 'document',
  groups: [
    { name: 'contacto', title: '📞  Contacto', default: true },
    { name: 'taller', title: '🏠  El Taller' },
  ],
  fields: [
    // ─── CONTACTO ───────────────────────────────────────────────────────
    defineField({
      name: 'telefono',
      title: 'Número de WhatsApp',
      type: 'string',
      group: 'contacto',
      description: '📱 Tu número de WhatsApp con código de país. Ejemplo: +5492235000000. Este número activa el botón de WhatsApp que aparece en cada pieza.',
      placeholder: '+5492235000000',
    }),
    defineField({
      name: 'email',
      title: 'Email de contacto',
      type: 'string',
      group: 'contacto',
      description: '✉️ Email que aparecerá en el pie de página y en la página de contacto.',
      placeholder: 'hola@skilglass.com',
    }),
    defineField({
      name: 'horario',
      title: 'Horario de Soplete / Taller',
      type: 'string',
      group: 'contacto',
      description: '🔥 Horario de atención o trabajo. Ejemplo: Lunes a Viernes, 10:00 — 18:00 (GMT-3).',
      placeholder: 'Lunes a Viernes, 10:00 — 18:00 (GMT-3)',
    }),
    defineField({
      name: 'contactoTitulo',
      title: 'Título Página de Contacto',
      type: 'string',
      group: 'contacto',
      initialValue: 'Conversaciones con el Taller',
      description: 'El título principal que aparece en la página de contacto.',
    }),
    defineField({
      name: 'contactoTexto',
      title: 'Frase Editorial de Contacto',
      type: 'text',
      group: 'contacto',
      rows: 3,
      initialValue: '“El cristal es un lenguaje de paciencia. Si tienes una consulta sobre una pieza, una colaboración especial o simplemente quieres saludarnos, estamos al otro lado de la flama.”',
      description: 'La frase inspiracional que aparece debajo del título.',
    }),

    // ─── TALLER ─────────────────────────────────────────────────────────
    defineField({
      name: 'direccion',
      title: 'Dirección del taller (opcional)',
      type: 'string',
      group: 'taller',
      description: '🏠 Solo completá este campo si querés mostrar tu dirección públicamente. Podés dejarlo vacío.',
      placeholder: 'Mar del Plata, Buenos Aires',
    }),
  ],
})

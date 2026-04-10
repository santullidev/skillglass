import { defineField, defineType } from 'sanity'

export const settingsSchema = defineType({
  name: 'settings',
  title: '⚙️  Configuración General',
  type: 'document',
  groups: [
    { name: 'contacto', title: '📞  Contacto', default: true },
    { name: 'redes', title: '📱  Redes Sociales' },
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

    // ─── REDES ──────────────────────────────────────────────────────────
    defineField({
      name: 'instagram',
      title: 'Perfil de Instagram',
      type: 'url',
      group: 'redes',
      description: '📷 Link completo al perfil de Instagram. Ejemplo: https://instagram.com/skilglass — aparecerá como ícono en el sitio.',
      placeholder: 'https://instagram.com/skilglass',
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

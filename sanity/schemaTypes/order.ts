import { defineField, defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'pedido',
  title: 'Pedidos (Ventas)',
  type: 'document',
  // Los pedidos se crean automáticamente — nadie los crea a mano
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'resumen', title: '📋  Resumen del pedido', default: true },
    { name: 'cliente', title: '👤  Datos del cliente' },
    { name: 'envio', title: '📦  Datos de envío' },
    { name: 'gestion', title: '🚚  Gestión del envío' },
  ],
  fields: [
    // ─── RESUMEN ────────────────────────────────────────────────────────
    defineField({
      name: 'idMercadoPago',
      title: 'Número de operación (MercadoPago)',
      type: 'string',
      group: 'resumen',
      readOnly: true,
      description: '🔒 ID único de la transacción en MercadoPago. Solo lectura — se completa automáticamente.',
    }),
    defineField({
      name: 'fecha',
      title: 'Fecha y hora de la compra',
      type: 'datetime',
      group: 'resumen',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
      description: '📅 Fecha y hora exacta en que se realizó la compra. Automático.',
    }),
    defineField({
      name: 'montoTotal',
      title: 'Monto total cobrado (ARS)',
      type: 'number',
      group: 'resumen',
      readOnly: true,
      description: '💰 Total cobrado al cliente en pesos argentinos. Automático.',
    }),
    defineField({
      name: 'estado',
      title: 'Estado del pago',
      type: 'string',
      group: 'resumen',
      options: {
        list: [
          { title: '✅  Aprobado', value: 'approved' },
          { title: '⏳  Pendiente', value: 'pending' },
          { title: '❌  Anulado', value: 'cancelled' },
          { title: '🚫  Rechazado', value: 'rejected' },
        ],
        layout: 'radio',
      },
      readOnly: true,
      description: '🔒 Estado del pago confirmado por MercadoPago. Solo lectura — se actualiza automáticamente.',
    }),
    defineField({
      name: 'productos',
      title: 'Piezas compradas',
      type: 'array',
      group: 'resumen',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'nombre', subtitle: 'precio' },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Pieza sin nombre',
                subtitle: subtitle ? `$${subtitle.toLocaleString('es-AR')} ARS` : '',
              }
            },
          },
          fields: [
            {
              name: 'id',
              type: 'string',
              title: 'ID de la pieza',
              readOnly: true,
              description: 'Identificador interno de la pieza vendida.',
            },
            {
              name: 'nombre',
              type: 'string',
              title: 'Nombre de la pieza',
              readOnly: true,
            },
            {
              name: 'cantidad',
              type: 'number',
              title: 'Cantidad',
              readOnly: true,
            },
            {
              name: 'precio',
              type: 'number',
              title: 'Precio unitario (ARS)',
              readOnly: true,
            },
            {
              name: 'numeroCertificado',
              type: 'string',
              title: 'Número de Certificado',
              readOnly: true,
              description: 'Número único del certificado de esta pieza en el momento de la venta.',
            },
          ],
        },
      ],
      readOnly: true,
      description: '🔒 Piezas incluidas en esta compra. Se completa automáticamente.',
    }),
    defineField({
      name: 'referenciaExterna',
      title: 'Referencia interna',
      type: 'string',
      group: 'resumen',
      readOnly: true,
      description: '🔒 Referencia técnica del pedido. Automático.',
      hidden: true, // Oculto por defecto — solo tech
    }),

    // ─── CLIENTE ────────────────────────────────────────────────────────
    defineField({
      name: 'cliente',
      title: 'Datos del cliente',
      type: 'object',
      group: 'cliente',
      readOnly: true,
      description: '🔒 Información del comprador. Se completa automáticamente desde el formulario de la tienda.',
      fields: [
        {
          name: 'nombre',
          type: 'string',
          title: 'Nombre completo',
        },
        {
          name: 'email',
          type: 'string',
          title: 'Email de contacto',
        },
        {
          name: 'telefono',
          type: 'string',
          title: 'Teléfono / WhatsApp',
        },
      ],
    }),

    // ─── ENVÍO (READ ONLY) ───────────────────────────────────────────────
    defineField({
      name: 'envio',
      title: 'Dirección de entrega',
      type: 'object',
      group: 'envio',
      readOnly: true,
      description: '🔒 Dirección ingresada por el cliente al comprar. Solo lectura.',
      fields: [
        { name: 'tipo', type: 'string', title: 'Tipo de envío (domicilio/sucursal)' },
        { name: 'provincia', type: 'string', title: 'Provincia' },
        { name: 'ciudad', type: 'string', title: 'Ciudad / Localidad' },
        { name: 'direccion', type: 'string', title: 'Calle y número' },
        { name: 'codigoPostal', type: 'string', title: 'Código Postal (CP)' },
        { name: 'costo', type: 'number', title: 'Costo del envío (ARS)' },
        { name: 'sucursalId', type: 'string', title: 'ID Sucursal Andreani (si aplica)' },
        { name: 'sucursalNombre', type: 'string', title: 'Nombre de Sucursal' },
        {
          name: 'notas',
          type: 'text',
          title: 'Notas adicionales del cliente',
        },
      ],
    }),

    // ─── GESTIÓN (EDITABLE) ─────────────────────────────────────────────
    defineField({
      name: 'estadoEnvio',
      title: '🚚 Estado del envío (Andreani)',
      type: 'string',
      group: 'gestion',
      options: {
        list: [
          { title: '⏳  Pendiente de preparación', value: 'pendiente' },
          { title: '📦  Generando etiqueta Andreani', value: 'generando_etiqueta' },
          { title: '🚀  Despachado / Con número de seguimiento', value: 'despachado' },
          { title: '✅  Entregado', value: 'entregado' },
          { title: '❌  Error en vinculación', value: 'error_logistica' },
        ],
        layout: 'radio',
      },
      initialValue: 'pendiente',
    }),
    defineField({
      name: 'numeroAndreani',
      title: 'Número de Envío (Andreani)',
      type: 'string',
      group: 'gestion',
      description: 'Cargado automáticamente tras el pago.',
    }),
    defineField({
      name: 'urlEtiqueta',
      title: 'Link a la Etiqueta de Envío',
      type: 'url',
      group: 'gestion',
      description: 'URL directa para descargar el PDF de la etiqueta.',
    }),
  ],
  orderings: [
    {
      title: 'Más reciente primero',
      name: 'fechaDesc',
      by: [{ field: 'fecha', direction: 'desc' }],
    },
    {
      title: 'Por estado de envío',
      name: 'estadoEnvio',
      by: [{ field: 'estadoEnvio', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      cliente: 'cliente.nombre',
      monto: 'montoTotal',
      estado: 'estadoEnvio',
      fecha: 'fecha',
    },
    prepare({ cliente, monto, estado, fecha }) {
      const estadoIcons: Record<string, string> = {
        pendiente: '⏳',
        preparando: '📦',
        despachado: '🚀',
        entregado: '✅',
      }
      const icon = estadoIcons[estado] || '🛒'
      const fechaStr = fecha
        ? new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : ''
      return {
        title: `${icon} ${cliente || 'Cliente desconocido'}`,
        subtitle: `${fechaStr} · $${(monto || 0).toLocaleString('es-AR')} ARS`,
      }
    },
  },
})

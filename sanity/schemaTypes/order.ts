import { defineField, defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'pedido',
  title: 'Pedidos (Ventas)',
  type: 'document',
  fields: [
    defineField({
      name: 'idMercadoPago',
      title: 'ID MercadoPago',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'referenciaExterna',
      title: 'Referencia Externa',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'montoTotal',
      title: 'Monto Total (ARS)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'estado',
      title: 'Estado del Pago',
      type: 'string',
      options: {
        list: [
          { title: 'Aprobado', value: 'approved' },
          { title: 'Pendiente', value: 'pending' },
          { title: 'Anulado', value: 'cancelled' },
          { title: 'Rechazado', value: 'rejected' },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: 'productos',
      title: 'Productos Comprados',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string', title: 'ID Producto' },
            { name: 'nombre', type: 'string', title: 'Nombre' },
            { name: 'cantidad', type: 'number', title: 'Cantidad' },
            { name: 'precio', type: 'number', title: 'Precio Unitario' },
          ],
        },
      ],
      readOnly: true,
    }),
    defineField({
      name: 'cliente',
      title: 'Datos del Cliente',
      type: 'object',
      fields: [
        { name: 'nombre', type: 'string', title: 'Nombre completo' },
        { name: 'email', type: 'string', title: 'Email' },
        { name: 'telefono', type: 'string', title: 'Teléfono' },
      ],
      readOnly: true,
    }),
    defineField({
      name: 'envio',
      title: 'Datos de Envío',
      type: 'object',
      fields: [
        { name: 'provincia', type: 'string', title: 'Provincia' },
        { name: 'ciudad', type: 'string', title: 'Ciudad' },
        { name: 'direccion', type: 'string', title: 'Dirección' },
        { name: 'codigoPostal', type: 'string', title: 'CP' },
        { name: 'notas', type: 'text', title: 'Notas de envío' },
      ],
      readOnly: true,
    }),
    defineField({
      name: 'estadoEnvio',
      title: 'Estado del Envío',
      type: 'string',
      options: {
        list: [
          { title: 'Pendiente de preparación', value: 'pendiente' },
          { title: 'En preparación', value: 'preparando' },
          { title: 'Despachado', value: 'despachado' },
          { title: 'Entregado', value: 'entregado' },
        ],
      },
      initialValue: 'pendiente',
    }),
    defineField({
      name: 'fecha',
      title: 'Fecha',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Fecha (más reciente)',
      name: 'fechaDesc',
      by: [{ field: 'fecha', direction: 'desc' }],
    },
  ],
})

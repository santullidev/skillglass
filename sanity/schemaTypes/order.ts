import { defineField, defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'pedido',
  title: 'Pedidos (Ventas)',
  type: 'document',
  fields: [
    defineField({
      name: 'idMercadoPago',
      title: 'ID de Pago Mercado Pago',
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
      name: 'productos',
      title: 'Productos Comprados',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'nombre', type: 'string' },
            { name: 'cantidad', type: 'number' },
            { name: 'precio', type: 'number' },
          ],
        },
      ],
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
      name: 'fecha',
      title: 'Fecha de Creación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
})

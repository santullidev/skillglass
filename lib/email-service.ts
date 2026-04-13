import { Resend } from 'resend';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  shippingData: {
    direccion: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
}

export async function sendOrderEmails(data: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY no configurado. No se enviarán correos.');
    return { success: false, error: 'Missing API Key' };
  }

  const resend = new Resend(apiKey);
  const { customerEmail, customerName, totalAmount, items, orderId, shippingData } = data;

  try {
    // 1. Email al Comprador
    await resend.emails.send({
      from: 'SKILGLASS <ventas@skilglass.art>',
      to: customerEmail,
      subject: `Confirmación de compra #${orderId} - SKILGLASS`,
      html: `
        <div style="font-family: serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="text-align: center; color: #c9a84c;">SKILGLASS</h1>
          <p>Hola ${customerName},</p>
          <p>Gracias por tu compra. Tu pedido ha sido confirmado y pronto comenzaremos a preparar tu pieza de autor.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin: 20px 0;">
            <h3 style="margin-top: 0;">Resumen del Pedido</h3>
            <ul style="list-style: none; padding: 0;">
              ${items.map((item: any) => `
                <li style="margin-bottom: 10px;">
                  ${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </li>
              `).join('')}
            </ul>
            <p style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">Total: $${totalAmount.toLocaleString('es-AR')} ARS</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Datos de Envío</h3>
            <p>${shippingData.direccion}<br>
            ${shippingData.ciudad}, ${shippingData.provincia}<br>
            CP: ${shippingData.codigoPostal}</p>
          </div>

          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
            Cada pieza de SKILGLASS es única y moldeada artesanalmente. Gracias por valorar el arte en vidrio.
          </p>
        </div>
      `,
    });

    // 2. Notificación al Vendedor
    await resend.emails.send({
      from: 'Sistema SKILGLASS <novedades@skilglass.art>',
      to: 'ventas@skilglass.art',
      subject: `🚨 NUEVA VENTA #${orderId} - $${totalAmount}`,
      html: `
        <h2>Nueva venta realizada</h2>
        <p><strong>Cliente:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Total:</strong> $${totalAmount.toLocaleString('es-AR')}</p>
        <p><strong>ID MP:</strong> ${orderId}</p>
        <hr>
        <p>Entra al Studio de Sanity para procesar el envío.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error enviando emails:', error);
    return { success: false, error };
  }
}

import { Resend } from 'resend';
import { client } from '@/lib/sanity';
import { SETTINGS_QUERY } from '@/lib/queries';

/**
 * Escapa HTML antes de interpolarlo en el cuerpo del mail.
 *
 * El nombre y la direccion los escribe el comprador en el checkout, y la
 * validacion del servidor no restringe caracteres. Sin escapar, alguien puede
 * inyectar markup arbitrario en el mail de confirmacion y, sobre todo, en la
 * notificacion de venta que recibe Skilglass.
 */
function escaparHtml(valor: unknown): string {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

/**
 * Remitente de los correos de pedido.
 *
 * El dominio estaba hardcodeado como `skilglass.art`, que no es el del sitio
 * (`skilglass.com.ar`). Si el dominio del remitente no está verificado en
 * Resend el envío falla, y como el error queda capturado los mails
 * desaparecían en silencio.
 *
 * ⚠️ El dominio que se use acá tiene que estar verificado en Resend.
 */
const REMITENTE = process.env.RESEND_FROM_EMAIL || 'hola@skilglass.com.ar'

/** Fallback del aviso de venta, si Sanity no tiene email cargado. */
const EMAIL_VENTAS_FALLBACK = process.env.VENTAS_EMAIL || 'hola@skilglass.com.ar'

/**
 * Casilla que recibe el aviso de venta nueva.
 * Sale de Sanity para que se pueda cambiar sin tocar código.
 */
async function obtenerEmailDeVentas(): Promise<string> {
  try {
    const settings = await client.fetch(SETTINGS_QUERY)
    return settings?.email || EMAIL_VENTAS_FALLBACK
  } catch (error) {
    console.error('No se pudo leer el email de contacto de Sanity:', error)
    return EMAIL_VENTAS_FALLBACK
  }
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
      from: `SKILGLASS <${REMITENTE}>`,
      to: customerEmail,
      subject: `Confirmación de compra #${orderId} - SKILGLASS`,
      html: `
        <div style="font-family: serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="text-align: center; color: #c9a84c;">SKILGLASS</h1>
          <p>Hola ${escaparHtml(customerName)},</p>
          <p>Gracias por tu compra. Tu pedido ha sido confirmado y pronto comenzaremos a preparar tu pieza de autor.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin: 20px 0;">
            <h3 style="margin-top: 0;">Resumen del Pedido</h3>
            <ul style="list-style: none; padding: 0;">
              ${items.map((item) => `
                <li style="margin-bottom: 10px;">
                  ${escaparHtml(item.nombre)} x ${Number(item.cantidad)} - $${(Number(item.precio) * Number(item.cantidad)).toLocaleString('es-AR')}
                </li>
              `).join('')}
            </ul>
            <p style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">Total: $${totalAmount.toLocaleString('es-AR')} ARS</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Datos de Envío</h3>
            <p>${escaparHtml(shippingData.direccion)}<br>
            ${escaparHtml(shippingData.ciudad)}, ${escaparHtml(shippingData.provincia)}<br>
            CP: ${escaparHtml(shippingData.codigoPostal)}</p>
          </div>

          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
            Cada pieza de SKILGLASS es única y moldeada artesanalmente. Gracias por valorar el arte en vidrio.
          </p>
        </div>
      `,
    });

    // 2. Notificación al Vendedor
    await resend.emails.send({
      from: `Sistema SKILGLASS <${REMITENTE}>`,
      to: await obtenerEmailDeVentas(),
      subject: `🚨 NUEVA VENTA #${orderId} - $${totalAmount}`,
      html: `
        <h2>Nueva venta realizada</h2>
        <p><strong>Cliente:</strong> ${escaparHtml(customerName)} (${escaparHtml(customerEmail)})</p>
        <p><strong>Total:</strong> $${totalAmount.toLocaleString('es-AR')}</p>
        <p><strong>ID MP:</strong> ${escaparHtml(orderId)}</p>
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

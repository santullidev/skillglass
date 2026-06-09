import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { client } from '@/sanity/lib/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { nombre, email, asunto, mensaje } = await request.json();

    // Temporalmente hardcodeado para testing, luego volverá a apuntar a Sanity
    const testEmail = 'santulli.dev@gmail.com';

    const { data, error } = await resend.emails.send({
      // El FROM debe ser un correo de tu dominio verificado en Resend (ej: info@tudominio.com)
      from: `Contacto Web <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: [testEmail],
      replyTo: email,
      subject: `Nuevo mensaje de contacto: ${asunto}`,
      html: `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Error de Resend al intentar enviar:', error);
      return NextResponse.json({ error: 'Error de Resend' }, { status: 500 });
    }

    console.log('Email enviado correctamente:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al enviar el email:', error);
    return NextResponse.json({ error: 'Hubo un error al enviar el email' }, { status: 500 });
  }
}

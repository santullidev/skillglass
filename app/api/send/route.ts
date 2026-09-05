import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { client } from '@/lib/sanity'
import { SETTINGS_QUERY } from '@/lib/queries'
import { rateLimit, obtenerIp } from '@/lib/rate-limit'
import { errorInterno, errorDeValidacion } from '@/lib/api-errors'

const apiKey = process.env.RESEND_API_KEY

// Cliente perezoso: instanciar Resend en el módulo tumba la ruta entera si
// falta la API key.
let resendClient: Resend | null = null
function getResend(): Resend {
  if (!apiKey) throw new Error('RESEND_API_KEY no está configurado')
  resendClient ??= new Resend(apiKey)
  return resendClient
}

/**
 * Dos niveles, a propósito:
 *  - ENVIOS: lo caro (mandar un mail). Estricto.
 *  - REQUESTS: freno grueso contra hammering. Holgado, para que a un usuario
 *    que se equivoca escribiendo el email no lo bloqueemos por 10 minutos.
 */
const LIMITE_ENVIOS = 3
const LIMITE_REQUESTS = 30
const VENTANA_MS = 10 * 60 * 1000

const LIMITES = {
  nombre: 100,
  email: 254, // longitud máxima de un email según RFC 5321
  asunto: 150,
  mensaje: 5000,
} as const

/**
 * Escapa HTML. El cuerpo del mail se arma con interpolación, así que sin esto
 * cualquiera puede inyectar markup arbitrario —incluidos links de phishing—
 * en un correo que llega con el formato legítimo del sitio.
 */
function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Quita saltos de línea: en una cabecera de mail habilitan header injection. */
function limpiarCabecera(valor: string): string {
  return valor.replace(/[\r\n]+/g, ' ').trim()
}

function leerCampo(body: Record<string, unknown>, nombre: keyof typeof LIMITES): string | null {
  const valor = body[nombre]
  if (typeof valor !== 'string') return null
  const limpio = valor.trim()
  if (!limpio || limpio.length > LIMITES[nombre]) return null
  return limpio
}

function demasiadasSolicitudes(reintentarEn: number) {
  return NextResponse.json(
    { error: 'Demasiados mensajes seguidos. Probá de nuevo en unos minutos.' },
    { status: 429, headers: { 'Retry-After': String(reintentarEn) } }
  )
}

export async function POST(req: NextRequest) {
  const ip = obtenerIp(req)

  const freno = rateLimit(`send:req:${ip}`, LIMITE_REQUESTS, VENTANA_MS)
  if (!freno.permitido) return demasiadasSolicitudes(freno.reintentarEn)

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return errorDeValidacion('Solicitud inválida')
    }

    const datos = body as Record<string, unknown>
    const nombre = leerCampo(datos, 'nombre')
    const email = leerCampo(datos, 'email')
    const asunto = leerCampo(datos, 'asunto')
    const mensaje = leerCampo(datos, 'mensaje')

    if (!nombre || !email || !asunto || !mensaje) {
      return errorDeValidacion('Completá todos los campos del formulario')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorDeValidacion('Ingresá un email válido')
    }

    // Recién acá se consume el cupo caro: un formulario mal completado no
    // gasta envíos.
    const envio = rateLimit(`send:mail:${ip}`, LIMITE_ENVIOS, VENTANA_MS)
    if (!envio.permitido) return demasiadasSolicitudes(envio.reintentarEn)

    // El destinatario sale de Sanity, no del código. Antes estaba hardcodeado
    // al mail del desarrollador, así que las consultas de clientes no llegaban
    // a Skilglass.
    const settings = await client.fetch(SETTINGS_QUERY)
    const destinatario = settings?.email || process.env.CONTACTO_EMAIL_FALLBACK

    if (!destinatario) {
      console.error('No hay email de contacto configurado en Sanity ni en CONTACTO_EMAIL_FALLBACK')
      return errorInterno('send: sin destinatario', new Error('destinatario no configurado'))
    }

    const { error } = await getResend().emails.send({
      from: `Contacto Web <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: [destinatario],
      replyTo: email,
      subject: `Nuevo mensaje de contacto: ${limpiarCabecera(asunto)}`,
      html: `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${escaparHtml(nombre)}</p>
        <p><strong>Email:</strong> ${escaparHtml(email)}</p>
        <p><strong>Asunto:</strong> ${escaparHtml(asunto)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escaparHtml(mensaje).replace(/\n/g, '<br>')}</p>
      `,
    })

    if (error) {
      return errorInterno('send: Resend rechazó el envío', error, 'No pudimos enviar tu mensaje. Probá de nuevo.')
    }

    // No se devuelve la respuesta de Resend: incluye ids internos del proveedor.
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorInterno('send', error, 'No pudimos enviar tu mensaje. Probá de nuevo.')
  }
}

import Link from 'next/link'
import { client } from '@/lib/sanity'
import { SOPORTE_QUERY } from '@/lib/queries'
import { PortableText, PortableTextComponents } from '@portabletext/react'

export const revalidate = 60

export const metadata = {
  title: 'Soporte y Contacto | SKILGLASS',
  description: 'Centro de atención al cliente, cuidados del cristal y tiempos de envío de nuestra joyería de soplado a la flama.',
}

interface Seccion {
  id?: string
  titulo: string
  contenido: import('@portabletext/react').PortableTextProps['value']
}

interface FAQ {
  pregunta: string
  respuesta: string
}

interface SoporteData {
  titulo?: string
  subtitulo?: string
  secciones?: Seccion[]
  faqs?: FAQ[]
}

// Custom components for Portable Text to keep the editorial style
const ptComponents: PortableTextComponents = {
  block: {
    normal: ({children}: {children?: React.ReactNode}) => <p className="mb-6">{children}</p>,
  },
  list: {
    bullet: ({children}: {children?: React.ReactNode}) => <ul className="space-y-4 mb-8">{children}</ul>,
  },
  listItem: {
    bullet: ({children}: {children?: React.ReactNode}) => (
      <li className="flex items-start gap-3 text-on-surface-variant">
        <span className="text-primary mt-1">✧</span>
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({children}: {children?: React.ReactNode}) => <strong className="text-on-surface font-bold">{children}</strong>,
  },
}

export default async function SoportePage() {
  const data: SoporteData = await client.fetch(SOPORTE_QUERY)

  // Fallbacks if no CMS data yet
  const titulo = data?.titulo || '¿Cómo podemos ayudarte?'
  const subtitulo = data?.subtitulo || 'En SKILGLASS cada pieza es esculpida a mano en el fuego. Nuestro soporte es personal y directo.'
  const secciones = data?.secciones || []
  const faqs = data?.faqs || []

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24">
      {/* ── CABECERA ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-24 text-center">
        <p
          className="text-[10px] tracking-[0.4em] text-primary uppercase mb-6"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Centro de Asistencia
        </p>
        <h1
          className="text-5xl lg:text-7xl text-on-surface mb-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {titulo}
        </h1>
        <p className="text-on-surface-variant font-serif italic text-lg leading-relaxed max-w-2xl mx-auto">
          {subtitulo}
        </p>
      </section>

      {/* ── SECCIONES DINÁMICAS ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="space-y-16">
          {secciones.map((sec: Seccion, i: number) => (
            <div key={i} id={sec.id} className="border-t border-outline-variant/20 pt-12">
              <h2 
                className="text-3xl text-on-surface mb-8"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {sec.titulo}
              </h2>
              <div className="prose prose-invert prose-p:text-on-surface-variant prose-p:leading-relaxed max-w-none">
                <PortableText 
                  value={sec.contenido} 
                  components={ptComponents}
                />
              </div>
            </div>
          ))}

          {/* FAQs si existen */}
          {faqs.length > 0 && (
            <div id="faq" className="border-t border-outline-variant/20 pt-12">
              <h2 
                className="text-3xl text-on-surface mb-10"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Preguntas Frecuentes
              </h2>
              <div className="grid gap-8">
                {faqs.map((faq: FAQ, i: number) => (
                  <div key={i} className="bg-surface-container-lowest p-8 border border-outline-variant/10 group hover:border-primary/30 transition-colors">
                    <h3 className="text-lg text-on-surface mb-4 font-serif italic flex items-center gap-3">
                      <span className="text-primary group-hover:scale-125 transition-transform">?</span>
                      {faq.pregunta}
                    </h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed pl-6 border-l border-primary/20">
                      {faq.respuesta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACTO DIRECTO ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mt-24">
        <div className="bg-surface-container-low border border-outline-variant/10 p-10 lg:p-16 text-center">
          <h3 
            className="text-2xl text-on-surface mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-on-surface-variant text-sm mb-10 max-w-lg mx-auto">
            Mándanos un mensaje directamente a nuestro equipo del taller. Tratamos de responder todos los mensajes antes de apagar el soplete al final del día.
          </p>
          
          <div className="flex justify-center">
            <Link
              href="/contacto"
              className="px-12 py-6 border border-outline-variant/30 text-on-surface font-bold text-[10px] tracking-[0.3em] uppercase hover:border-primary hover:text-primary transition-all duration-500 bg-surface-container-low/50"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Ir al Formulario de Contacto
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

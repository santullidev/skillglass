import { client } from "@/lib/sanity";
import { SETTINGS_QUERY } from "@/lib/queries";
import ContactForm from "./ContactForm";
import * as motion from "framer-motion/client";

export default async function ContactoPage() {
  const settings = await client.fetch(SETTINGS_QUERY);
  const email = settings?.email || "taller@skilglass.com";

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 relative overflow-hidden">
      {/* Background Decor - Vidrio Glow */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-tertiary/5 blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-start">
          
          {/* Columna Izquierda: Mensaje Editorial */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            <p className="text-[10px] tracking-[0.4em] text-primary uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>
              DIÁLOGO DIRECTO
            </p>
            <h1 className="text-6xl lg:text-8xl text-on-surface mb-12 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Conversaciones con el Taller
            </h1>
            <p className="text-xl text-on-surface-variant font-serif italic leading-relaxed mb-16 max-w-lg">
              &ldquo;El cristal es un lenguaje de paciencia. Si tienes una consulta sobre una pieza, una colaboración especial o simplemente quieres saludarnos, estamos al otro lado de la flama.&rdquo;
            </p>
            
            <div className="space-y-12 border-l border-outline-variant/30 pl-8">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-outline block mb-3" style={{ fontFamily: 'var(--font-label)' }}>Consultas Generales</span>
                <a href={`mailto:${email}`} className="text-2xl text-on-surface hover:text-primary transition-colors font-serif">{email}</a>
              </div>
              {settings?.direccion && (
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-outline block mb-3" style={{ fontFamily: 'var(--font-label)' }}>Nuestro Estudio</span>
                  <p className="text-lg text-on-surface font-serif">{settings.direccion}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] tracking-widest uppercase text-outline block mb-3" style={{ fontFamily: 'var(--font-label)' }}>Horario de Soplete</span>
                <p className="text-lg text-on-surface font-serif">Lunes a Viernes<br />10:00 — 18:00 (GMT-3)</p>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Formulario */}
          <ContactForm />
        </div>
      </div>
    </div>
  )
}

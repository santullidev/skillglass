import { client, urlFor } from "@/lib/sanity";
import { SETTINGS_QUERY } from "@/lib/queries";
import ContactForm from "./ContactForm";
import * as motion from "framer-motion/client";
import Image from "next/image";

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
              {settings?.contactoTitulo || "Conversaciones con el Taller"}
            </h1>
            <p className="text-xl text-on-surface-variant font-serif italic leading-relaxed mb-16 max-w-lg">
              &ldquo;{settings?.contactoTexto || "El cristal es un lenguaje de paciencia. Si tienes una consulta sobre una pieza, una colaboración especial o simplemente quieres saludarnos, estamos al otro lado de la flama."}&rdquo;
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
              {settings?.horario && (
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-outline block mb-3" style={{ fontFamily: 'var(--font-label)' }}>Horario de Soplete</span>
                  <p className="text-lg text-on-surface font-serif whitespace-pre-line">{settings.horario}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Columna Derecha: Formulario */}
          <ContactForm />
        </div>

        {/* Nueva Sección: Puntos de Venta Físicos */}
        {settings?.puntosDeVenta && settings.puntosDeVenta.length > 0 && (
          <div id="puntos-de-venta" className="mt-32 border-t border-outline-variant/20 pt-24">
            <p className="text-[10px] tracking-[0.4em] text-primary uppercase mb-6" style={{ fontFamily: 'var(--font-label)' }}>
              {settings.puntosDeVentaTitulo || 'PUNTO DE VENTA FÍSICO'}
            </p>
            <h2 className="text-4xl lg:text-5xl text-on-surface mb-12" style={{ fontFamily: 'var(--font-display)' }}>
              Visítanos en el Estudio
            </h2>
            
            <div className="space-y-24">
              {settings.puntosDeVenta.map((punto: any, i: number) => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Imagen del Showroom */}
                  <div className="lg:col-span-7 relative aspect-video lg:aspect-[4/3] overflow-hidden group">
                    {punto.imagen ? (
                      <Image
                        src={urlFor(punto.imagen).width(1200).url()}
                        alt={punto.nombre || "Showroom"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-container" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-700" />
                  </div>
                  
                  {/* Detalles */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="space-y-8 border-l border-outline-variant/30 pl-8">
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-outline block mb-2" style={{ fontFamily: 'var(--font-label)' }}>{punto.nombre || 'Dirección'}</span>
                        <p className="text-xl text-on-surface font-serif">{punto.direccion}</p>
                      </div>
                      {punto.horario && (
                        <div>
                          <span className="text-[10px] tracking-widest uppercase text-outline block mb-2" style={{ fontFamily: 'var(--font-label)' }}>Horarios de Atención</span>
                          <p className="text-lg text-on-surface font-serif whitespace-pre-line">{punto.horario}</p>
                        </div>
                      )}
                      {punto.detalles && (
                        <div>
                          <span className="text-[10px] tracking-widest uppercase text-outline block mb-2" style={{ fontFamily: 'var(--font-label)' }}>Detalles</span>
                          <p className="text-sm text-on-surface-variant font-serif leading-relaxed">{punto.detalles}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

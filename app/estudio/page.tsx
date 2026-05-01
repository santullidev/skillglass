import Link from 'next/link'
import Image from 'next/image'
import { client, urlFor } from '@/lib/sanity'
import { ESTUDIO_PAGE_QUERY } from '@/lib/queries'

export const metadata = {
  title: 'El Estudio | SKILGLASS',
  description: 'Conoce los procesos artesanales y el soplado a la flama de nuestro taller de joyería de autor SKILGLASS.',
}

export const revalidate = 60

export default async function EstudioPage() {
  const data = await client.fetch(ESTUDIO_PAGE_QUERY)

  const heroLabel = data?.heroLabel || 'Adentrándose en el Fuego'
  const heroTitle = data?.heroTitle || 'El Pulso & la Flama'
  const heroImage = data?.heroImage

  const manifiestoTitle = data?.manifiestoTitle || 'Forjando la inestabilidad absoluta.'
  const manifiestoCita = data?.manifiestoCita || '“No somos una fábrica. No ensamblamos piezas frías. Cada gota de cristal es llevada a su límite térmico, donde deja de ser un sólido predecible para convertirse en una extensión de nuestra respiración.”'
  const manifiestoTexto = data?.manifiestoTexto || 'El soplado a la flama o lampworking es una coreografía de precisión. Una milésima de segundo extra en el fuego a 1000°C altera para siempre el centro de gravedad de una joya. En nuestro estudio, celebramos esa imperfección controlada. Cada anillo, pendiente o broche refleja la tensión innegable entre el calor extremo, el pulso humano y la repentina solidificación en el aire.'

  const fases = data?.fases || []
  const texturaFinalTexto = data?.texturaFinalTexto || 'Ciencia y\nSensibilidad.'

  const ctaEtiqueta = data?.ctaEtiqueta || 'El resultado final'
  const ctaTitulo = data?.ctaTitulo || 'Explora las piezas\nnacidas del fuego.'
  const ctaTextoBoton = data?.ctaTextoBoton || 'Ingresar al Catálogo'
  const ctaLink = data?.ctaLink || '/colecciones'

  // Helper para renderizar el título con el & en itálica si existe
  const renderHeroTitle = (title: string) => {
    if (title.includes('&')) {
      const parts = title.split('&')
      return (
        <>
          {parts[0]} <br className="hidden md:block"/>
          <span className="italic font-serif opacity-90">&amp;</span> {parts[1]}
        </>
      )
    }
    return title
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ── HERO ESTUDIO ───────────────────────────────────── */}
      <section className="relative h-[80vh] w-full mt-24">
        <div className="absolute inset-0 bg-surface-container-lowest">
          {heroImage ? (
            <Image 
              src={urlFor(heroImage).width(1920).url()} 
              alt="Estudio Skilglass Hero"
              fill
              className="w-full h-full object-cover opacity-80"
              priority
              sizes="100vw"
            />
          ) : (
            <Image 
              src="https://placehold.co/1920x1080/1a1215/e8def8?text=STUDIO+HERO\n(Macro+Torch+Shot)&font=Playfair+Display" 
              alt="Estudio Skilglass Hero"
              fill
              className="w-full h-full object-cover opacity-30"
              priority
              sizes="100vw"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/40 to-transparent" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-end items-center pb-24 px-6 text-center">
          <p
            className="text-[10px] sm:text-xs tracking-[0.4em] text-primary uppercase mb-6"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            {heroLabel}
          </p>
          <h1
            className="text-6xl sm:text-8xl lg:text-9xl text-on-surface leading-[0.85] tracking-tighter"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {renderHeroTitle(heroTitle)}
          </h1>
        </div>
      </section>

      {/* ── EL MANIFIESTO ──────────────────────────────────── */}
      <section className="py-24 lg:py-40 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-5">
            <h2
              className="text-4xl lg:text-6xl text-on-surface mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {manifiestoTitle}
            </h2>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-8">
            <p className="text-xl lg:text-2xl text-on-surface-variant font-serif italic leading-relaxed">
              &ldquo;{manifiestoCita.replace(/[“”""]/g, '')}&rdquo;
            </p>
            <p className="text-sm lg:text-base text-on-surface/70 leading-loose max-w-2xl">
              {manifiestoTexto}
            </p>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID DEL PROCESO TÉCNICO ─────────────────── */}
      <section className="py-24 bg-surface-container-low border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-1 border border-outline-variant/10 bg-outline-variant/10 shadow-2xl p-px">
            
            {fases.map((fase: any, i: number) => {
              const isEven = i % 2 === 0
              
              return (
                <div key={fase._key || i} className="contents">
                  {/* Bloque de Texto */}
                  <div className={`bg-surface p-12 lg:p-16 flex flex-col justify-between min-h-[400px] ${
                    isEven ? 'col-span-1 order-1' : 'col-span-1 md:order-2'
                  }`}>
                    <div>
                      <span className="text-primary/60 text-[10px] tracking-widest uppercase block mb-4" style={{ fontFamily: 'var(--font-label)' }}>
                        {fase.etiqueta || `Fase ${i + 1}`}
                      </span>
                      <h3 className="text-2xl text-on-surface mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                        {fase.titulo}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {fase.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Bloque de Imagen */}
                  <div className={`bg-surface col-span-1 md:col-span-2 relative overflow-hidden h-[400px] ${
                    isEven ? 'order-2' : 'md:order-1'
                  }`}>
                    {fase.imagen ? (
                      <Image 
                        src={urlFor(fase.imagen).width(1200).url()} 
                        alt={fase.titulo}
                        fill
                        className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                         <span className="text-outline-variant font-serif italic">Imagen en proceso</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-surface/20 via-transparent to-transparent" />
                  </div>
                </div>
              )
            })}

            {/* Bloque Final de Textura (Siempre al final) */}
            <div className="bg-surface col-span-1 md:col-span-3 relative overflow-hidden h-[300px] md:h-[400px] flex items-center justify-center p-12 text-balance border-t border-outline-variant/10">
              <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--color-primary) 0px, transparent 1px, transparent 10px, var(--color-primary) 10px)' }}
              />
              <div className="relative z-10 text-center">
                <p className="text-[10px] tracking-[0.4em] text-gold uppercase mb-6" style={{ fontFamily: 'var(--font-label)' }}>El equilibrio</p>
                <h3 className="text-3xl md:text-6xl text-on-surface whitespace-pre-line leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  {texturaFinalTexto}
                </h3>
              </div>
            </div>

            {/* Fallback si no hay fases cargadas */}
            {fases.length === 0 && (
              <div className="bg-surface p-12 lg:p-16 col-span-1 md:col-span-3 min-h-[400px] flex items-center justify-center">
                <p className="text-sm italic opacity-50 font-serif">Carga las fases técnicas en el Studio para ver el contenido.</p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── FOOTER CALL TO ACTION ──────────────────────────── */}
      <section className="py-32 lg:py-48 relative overflow-hidden flex flex-col items-center justify-center">
         <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at center, rgba(169, 199, 255, 0.05) 0%, transparent 70%)'
          }} />
          <p
            className="text-[10px] lg:text-xs tracking-[0.5em] text-primary uppercase mb-8 z-10"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            {ctaEtiqueta}
          </p>
          <h2
            className="text-5xl lg:text-7xl text-on-surface text-center leading-none mb-16 z-10 whitespace-pre-line"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {ctaTitulo}
          </h2>
          <Link
            href={ctaLink}
            className="group inline-flex items-center gap-4 text-xs tracking-[0.3em] text-on-surface uppercase border border-outline-variant/30 px-10 py-5 hover:border-primary hover:text-primary transition-all duration-500 overflow-hidden relative z-10"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            <span className="relative z-10">{ctaTextoBoton}</span>
            <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
            <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-surface-container transition-transform duration-500 ease-out" />
          </Link>
      </section>
    </div>
  )
}

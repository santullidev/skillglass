import { client, urlFor } from '@/lib/sanity'
import { 
  HERO_CONFIG_QUERY,
  CAPSULAS_SECTION_QUERY,
  ALQUIMIA_SECTION_QUERY,
  FRASE_SECTION_QUERY,
  PRODUCTOS_SECTION_QUERY,
  PROCESO_SECTION_QUERY,
  HOME_ESTUDIO_SECTION_QUERY,
  PRODUCTOS_QUERY, 
  DIARIO_TALLER_QUERY 
} from '@/lib/queries'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import CollectionCard from '@/components/CollectionCard'
import HeroSlider from '@/components/HeroSlider'
import type { Producto } from '@/types/producto'

export const revalidate = 60

// ─── Fallbacks por defecto (si no hay nada configurado en el Studio) ───
const DEFAULTS = {
  heroTitle: 'Maestría de la\nLuz Molten',
  heroSubtitle: 'Explorando el límite térmico del cristal.',
  tituloColecciones: 'Series Conceptuales',
  frase: 'Cada pieza nace de la tensión absoluta entre el fuego y la gravedad. Guiamos el cristal fundido a 1000°C para capturar un instante de luz eterna.',
  tituloPiezasDestacadas: 'Piezas Destacadas',
  alquimiaEtiqueta: 'CURACIÓN TÉCNICA',
  alquimiaSpecs: [
    { label: 'TEMPERATURA', valor: '820°C' },
    { label: 'MASA', valor: '114g' },
    { label: 'PROCESO', valor: 'JOYERÍA EN VIDRIO' },
  ],
  procesoEtiqueta: 'LA TÉCNICA',
  procesoTitulo: 'La Tensión de la Llama',
  procesoPasos: [
    { titulo: 'Pulso y Soplete', descripcion: 'Llevamos varillas de cristal puro a su punto de fusión exacto, dominando una llama viva para que obedezca al pulso de nuestras manos.' },
    { titulo: 'Sin Moldes', descripcion: 'La forma final de cada anillo o joya es dictada por la tensión superficial y nuestro control de la gravedad. Ninguna pieza es idéntica a otra.' },
    { titulo: 'Templado Íntimo', descripcion: 'Tras ser esculpidas en el fuego, las piezas reposan en un meticuloso proceso de templado artesanal para garantizar su resistencia eterna.' },
    { titulo: 'Luz Vestible', descripcion: 'Diseñamos prismas orgánicos. Creados no solo como accesorios, sino como piezas que interactúan con la refracción lumínica sobre tu piel.' },
  ],
  procesoCtaTexto: 'VER LAS CÁPSULAS',
  procesoCtaLink: '/colecciones',
}

export default async function Home() {
  const [
    heroData,
    capsulasData,
    alquimiaData,
    fraseData,
    productosData,
    procesoData,
    homeEstudioData,
    fallbackProductos,
    diario
  ] = await Promise.all([
    client.fetch(HERO_CONFIG_QUERY),
    client.fetch(CAPSULAS_SECTION_QUERY),
    client.fetch(ALQUIMIA_SECTION_QUERY),
    client.fetch(FRASE_SECTION_QUERY),
    client.fetch(PRODUCTOS_SECTION_QUERY),
    client.fetch(PROCESO_SECTION_QUERY),
    client.fetch(HOME_ESTUDIO_SECTION_QUERY),
    client.fetch<Producto[]>(PRODUCTOS_QUERY),
    client.fetch(DIARIO_TALLER_QUERY)
  ])

  // Normalización de datos para evitar errores de hidratación
  const hero = heroData || {}
  const capsulas = capsulasData || { coleccionesDestacadas: [] }
  const alquimia = alquimiaData || { activo: false }
  const fraseConfig = fraseData || { activo: false }
  const productosConfig = productosData || { productosDestacados: [] }
  const procesoConfig = procesoData || { activo: false }
  const homeEstudioConfig = homeEstudioData || { activo: false }


  // Resolución de textos
  const heroTitle = hero?.tituloHero || 'Joyas de\nAutor'
  const heroSubtitle = hero?.subtituloHero || DEFAULTS.heroSubtitle
  const tituloColecciones = capsulas?.tituloSeccionColecciones || DEFAULTS.tituloColecciones
  const frase = fraseConfig?.fraseEditorial || DEFAULTS.frase
  const autorFrase = fraseConfig?.autorFrase || 'SKILGLASS'
  const mostrarFrase = fraseConfig?.activo !== false
  const tituloPiezas = productosConfig?.tituloSeccionProductos || DEFAULTS.tituloPiezasDestacadas

  // Proceso
  const mostrarProceso = procesoConfig?.activo !== false
  const procesoEtiqueta = procesoConfig?.etiqueta || DEFAULTS.procesoEtiqueta
  const procesoTitulo = procesoConfig?.tituloProceso || DEFAULTS.procesoTitulo
  const procesoPasos = (procesoConfig?.pasosProceso && procesoConfig.pasosProceso.length > 0) 
    ? procesoConfig.pasosProceso 
    : DEFAULTS.procesoPasos

  // Alquimia
  const alquimiaEtiqueta = alquimia?.etiqueta || DEFAULTS.alquimiaEtiqueta
  const alquimiaSpecs = (alquimia?.specs && alquimia.specs.length > 0) 
    ? alquimia.specs 
    : DEFAULTS.alquimiaSpecs

  // Pilares / Pasos
  const pilares = procesoPasos

  // Productos (Mapeo robusto)
  const productos = (productosConfig?.productosDestacados && productosConfig.productosDestacados.length > 0)
    ? productosConfig.productosDestacados
    : (fallbackProductos || [])

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <HeroSlider
        images={hero?.fotosPortada}
        metadata={hero?.metadata}
        title={heroTitle}
        subtitle={heroSubtitle}
        ctaTexto={hero?.ctaTexto}
        ctaLink={hero?.ctaLink}
      />

      {/* ── COLECCIONES ───────────────────────────────────────── */}
      {capsulas?.coleccionesDestacadas && capsulas.coleccionesDestacadas.length > 0 && (
        <section id="colecciones" className="py-24 lg:py-40 px-6 lg:px-8 max-w-360 mx-auto w-full relative bg-surface-deep">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 relative z-10">
            <div>
              <p className="text-[10px] tracking-[0.5em] text-gold uppercase mb-6 font-bold" style={{ fontFamily: 'var(--font-label)' }}>
                CÁPSULAS
              </p>
              <h2
                className="text-5xl lg:text-7xl xl:text-8xl text-on-surface max-w-2xl leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {tituloColecciones}
              </h2>
            </div>
            <Link
              href="/capsulas"
              className="group inline-flex items-center gap-3 text-[10px] tracking-[0.4em] text-gold uppercase border-b border-gold/30 pb-2 hover:border-gold transition-all duration-500"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Explorar Series
              <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
            </Link>
          </div>
          {/* Glass framing line */}
          <div className="w-full h-px bg-linear-to-r from-outline-gold/5 via-outline-gold/40 to-outline-gold/5 mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {capsulas.coleccionesDestacadas.map((coleccion: any) => (
              <CollectionCard key={coleccion._id} coleccion={coleccion} />
            ))}
          </div>
        </section>
      )}

      {/* ── PIEZA DESTACADA (ALQUIMIA) ────────────────────────── */}
      {alquimia?.activo && (
        <section className="py-24 lg:py-40 bg-surface relative overflow-hidden border-y border-outline-gold/10">
          {/* Radial Refraction: Violeta/Dorado simulating light through glass */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-[100vw] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,rgba(131,56,236,0.05)_30%,transparent_70%)] blur-[100px] mix-blend-screen pointer-events-none" />
          
          <div className="max-w-360 mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

              {/* Izquierda: Fichas técnicas (Editorial Tech Plate) */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="flex flex-col gap-10">
                  {alquimiaSpecs.map((spec, i) => (
                    <div key={i} className="flex flex-col gap-2 p-5 border border-outline-gold/20 bg-surface-lowest/40 backdrop-blur-md relative group hover:border-gold/50 transition-all duration-500">
                      <div className="absolute top-0 left-0 w-4 h-px bg-gold/50" />
                      <div className="absolute top-0 left-0 w-px h-4 bg-gold/50" />
                      <span
                        className="text-[9px] tracking-[0.5em] text-gold mb-1 font-bold uppercase"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        {spec.label}
                      </span>
                      <span className="text-3xl text-on-surface font-serif italic group-hover:text-gold transition-colors duration-500">
                        {spec.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Centro: Imagen del producto contenida en vitrina de cristal */}
              <div className="lg:col-span-5 relative aspect-3/4 order-1 lg:order-2">
                <div className="absolute inset-0 bg-surface-container/20 backdrop-blur-sm border border-outline-variant/20 -m-6 md:-m-10" />
                <div className="absolute inset-0 border border-outline-variant/10 z-20 pointer-events-none" />
                {alquimia.producto?.imagenes?.[0] ? (
                  <Image
                    src={urlFor(alquimia.producto.imagenes[0]).width(800).height(1000).url()}
                    alt={alquimia.producto.nombre}
                    fill
                    className="object-cover relative z-10 shadow-2xl shadow-black/50"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-container flex items-center justify-center z-10">
                    <span className="text-on-surface-variant font-serif">Muestra de Cristal</span>
                  </div>
                )}
                {/* Reflejo/Gradient de vitrina sobre la imagen */}
                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-tertiary/10 mix-blend-overlay z-20 pointer-events-none" />
              </div>

              {/* Derecha: Narrativa */}
              <div className="lg:col-span-4 order-3 lg:pl-10">
                <p className="text-[10px] tracking-[0.5em] text-gold font-bold uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>
                  {alquimiaEtiqueta}
                </p>
                <h3
                  className="text-5xl lg:text-7xl text-on-surface mb-10 leading-[1.1]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {alquimia.producto?.nombre || 'La Alquimia del Cristal'}
                </h3>
                <p className="text-on-surface-variant font-serif leading-relaxed text-lg mb-12">
                  {alquimia.producto?.descripcion || 'Una exhibición de la maravilla del cristal. Esta pieza requirió mantener un pulso inquebrantable frente a la flama viva, resolviendo su propia geometría orgánica antes del enfriamiento final.'}
                </p>
                {alquimia.producto && (
                  <Link
                    href={`/productos/${alquimia.producto.slug}`}
                    className="btn-luxury group"
                  >
                    <span className="relative z-10 font-bold group-hover:text-surface-deep transition-colors">
                      Inspeccionar Obra
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FRASE EDITORIAL ───────────────────────────────────── */}
      {mostrarFrase && (
        <section className="py-20 lg:py-28 bg-surface-deep relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.1)_0%,transparent_60%)] blur-[120px] pointer-events-none" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[240px] text-surface-container opacity-10 font-serif leading-none select-none pointer-events-none">
            &ldquo;
          </div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <p className="text-2xl md:text-3xl lg:text-4xl leading-[1.6] text-gradient-gold font-serif italic drop-shadow-2xl text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {frase}
            </p>
            <div className="mt-12 inline-flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000 delay-500">
              <span className="w-px h-12 bg-gold/40 shadow-[0_0_10px_rgba(201,168,76,0.5)]" />
              <span className="text-[10px] tracking-[0.4em] text-gold uppercase" style={{ fontFamily: 'var(--font-label)' }}>{autorFrase}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTOS DESTACADOS ──────────────────────────────── */}
      <section id="piezas" className="py-32 lg:py-48 bg-surface-lowest overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />
        
        {/* Section Header — editorial, off-center */}
        <div className="max-w-360 mx-auto px-6 lg:px-8 mb-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
            <div className="relative">
              <div className="absolute -left-6 top-2 bottom-0 w-px bg-gold/30 hidden md:block" />
              <p
                className="text-[10px] tracking-[0.5em] text-gold font-bold uppercase mb-6"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                Sala de exposición
              </p>
              <h2
                className="text-6xl lg:text-9xl text-on-surface leading-none tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {tituloPiezas}
              </h2>
            </div>
            <div className="lg:max-w-sm lg:pb-3 border-l border-outline-gold/20 pl-6">
              <p className="text-on-surface-variant font-serif italic text-xl leading-relaxed mb-8">
                Joyería que nace de la pura destreza térmica. Un catálogo donde el asombro artesanal se encuentra con la fluidez del cristal soplado a la flama.
              </p>
              <Link
                href="/productos"
                className="group inline-flex items-center gap-3 text-[10px] tracking-[0.4em] text-gold font-bold uppercase border-b border-gold/30 pb-2 hover:border-gold transition-all duration-500"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                Catálogo Flameworking
                <span className="text-gold group-hover:translate-x-2 transition-transform duration-500">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Standardized Grid */}
        {productos.length > 0 && (
          <div className="max-w-360 mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12 transition-all duration-700">
              {productos.map((producto, idx) => (
                <div key={producto._id} className="flex flex-col w-full h-full">
                  <ProductCard 
                    producto={producto} 
                    index={idx} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tagline footer */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 flex items-center gap-6">
          <span className="flex-1 h-px bg-outline-variant/20" />
          <p
            className="text-[10px] tracking-[0.4em] text-outline-variant/40 uppercase shrink-0"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Joyería en Vidrio de Autor · Buenos Aires
          </p>
          <span className="flex-1 h-px bg-outline-variant/20" />
        </div>
      </section>

      {/* ── MANIFIESTO / EL CAOS CONTROLADO ──────────────────── */}
      {mostrarProceso && (
        <section id="proceso" className="bg-surface-container-low overflow-hidden">

          {/* ── PARTE SUPERIOR: Layout editorial de 2 columnas ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">

            {/* Columna izquierda: Imagen atmosférica */}
            <div className="relative min-h-[50vh] lg:min-h-full overflow-hidden">
              {procesoConfig?.imagen ? (
                <Image
                  src={urlFor(procesoConfig.imagen).width(1200).height(1400).url()}
                  alt="Proceso de joyería en vidrio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                /* Fallback: fondo con efecto horno */
                <div className="absolute inset-0 bg-surface-container-lowest">
                  <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 30% 70%, rgba(72, 12, 24, 0.9) 0%, rgba(34, 13, 16, 0.6) 45%, transparent 80%)'
                  }} />
                  <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 70% 30%, rgba(169, 199, 255, 0.06) 0%, transparent 60%)'
                  }} />
                  {/* Grid técnica decorativa */}
                  <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--color-outline-variant) 0px, transparent 1px, transparent 60px, var(--color-outline-variant) 60px), repeating-linear-gradient(90deg, var(--color-outline-variant) 0px, transparent 1px, transparent 60px, var(--color-outline-variant) 60px)' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-on-surface-variant/20 font-serif italic text-lg tracking-widest">
                      820° C
                    </p>
                  </div>
                </div>
              )}
              {/* Overlay gradiente hacia la derecha */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-surface-container-low hidden lg:block" />
            </div>

            {/* Columna derecha: Narrativa editorial */}
            <div className="flex flex-col justify-center px-10 lg:px-16 xl:px-20 py-20 lg:py-24">
              {/* Etiqueta */}
              <p
                className="text-[10px] tracking-[0.5em] text-gold font-bold uppercase mb-6"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                {procesoEtiqueta}
              </p>

              {/* Título grande */}
              <h2
                className="text-5xl lg:text-7xl xl:text-8xl text-on-surface leading-none mb-10"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {procesoTitulo}
              </h2>

              {/* Frase / Cita principal */}
              {(procesoConfig?.descripcion || true) && (
                <p className="text-lg text-on-surface-variant font-serif italic leading-relaxed mb-12 max-w-lg border-l-2 border-primary/30 pl-6">
                  {procesoConfig?.descripcion || 'Olvida la producción en masa. Cada joya de SKILGLASS es esculpida individualmente mediante la pura técnica del soplado a la flama. El artesano manipula el calor y el cristal líquido, moldeando la gota incandescente con precisión quirúrgica antes de que el aire la solidifique.'}
                </p>
              )}

              {/* Lista de pilares */}
              {pilares.length > 0 && (
                <div className="space-y-6 mb-12">
                  {pilares.map((feature: any, i: number) => (
                    <div key={i} className="flex gap-5 items-start group">
                      <span
                        className="text-primary/50 text-xs tracking-[0.3em] shrink-0 mt-1"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        0{i + 1}.
                      </span>
                      <div>
                        <h4
                          className="text-on-surface text-base mb-1 group-hover:text-primary transition-colors duration-300"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {feature.titulo}
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          {feature.descripcion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link
                href={procesoConfig?.ctaLink || DEFAULTS.procesoCtaLink}
                className="group self-start inline-flex items-center gap-4 text-[11px] tracking-[0.4em] text-on-surface uppercase border border-outline-variant/30 px-8 py-4 hover:border-primary hover:text-primary transition-all duration-500 overflow-hidden relative"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <span className="relative z-10">{procesoConfig?.ctaTexto || DEFAULTS.procesoCtaTexto}</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
                <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-surface-container transition-transform duration-500 ease-out" />
              </Link>
            </div>
          </div>

        </section>
      )}

      {/* ── SECCIÓN EL ESTUDIO (ACCESO) ────────────────────────── */}
      {homeEstudioConfig?.activo !== false && (
        <section className="relative py-24 lg:py-40 overflow-hidden flex items-center justify-center group/study">
          {/* Background Image with Cinematic Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {homeEstudioConfig?.imagen ? (
              <Image
                src={urlFor(homeEstudioConfig.imagen).width(2000).url()}
                alt={homeEstudioConfig.titulo || 'El Estudio'}
                fill
                className="object-cover transition-transform duration-[3s] ease-out group-hover/study:scale-110"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-surface-container-lowest" />
            )}
            {/* Multi-layered overlay for depth */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-linear-to-b from-surface via-transparent to-surface opacity-80" />
            <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <p className="text-[9px] tracking-[0.6em] text-gold font-bold uppercase mb-6 opacity-80" style={{ fontFamily: 'var(--font-label)' }}>
              Mística del Taller
            </p>
            <h2 className="text-4xl lg:text-7xl text-on-primary mb-8 leading-[0.9] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
              {homeEstudioConfig?.titulo || 'El Alma del Vidrio'}
            </h2>
            <div className="w-12 h-px bg-gold/30 mx-auto mb-8" />
            <p className="text-lg lg:text-xl text-on-primary/70 font-serif italic leading-relaxed mb-12 max-w-xl mx-auto">
              {homeEstudioConfig?.descripcion || 'Adéntrate en el proceso donde el fuego y la paciencia se encuentran. Conoce nuestro taller y la filosofía detrás de cada pieza única.'}
            </p>
            <Link
              href={homeEstudioConfig?.ctaLink || '/estudio'}
              className="group/btn inline-flex items-center gap-6 text-[10px] tracking-[0.5em] text-on-primary uppercase border border-on-primary/20 bg-on-primary/5 backdrop-blur-xs px-10 py-5 hover:border-gold hover:text-gold transition-all duration-700 overflow-hidden relative"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              <span className="relative z-10">{homeEstudioConfig?.ctaTexto || 'Explorar el Estudio'}</span>
              <span className="relative z-10 group-hover/btn:translate-x-2 transition-transform duration-500">→</span>
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-0 bg-gold/10 transition-transform duration-700 ease-in-out" />
            </Link>
          </div>
        </section>
      )}

      {/* ── SECCIÓN DIARIO DEL TALLER ─── */}
      {diario?.activo !== false && (
        <section className="pt-24 border-t border-outline-variant/10 bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 flex flex-col items-center text-center">
            <p
              className="text-[10px] tracking-[0.4em] text-primary uppercase mb-4"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              {diario?.titulo || 'Diario del Taller'}
            </p>
            <h2
              className="text-4xl lg:text-5xl text-on-surface mb-8"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {diario?.handle || '@skilglass'}
            </h2>
            <a 
              href={diario?.urlInstagram || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-colors border-b border-primary/20 pb-1"
            >
              Seguinos en la red
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {/* Feed Grid: 4 columnas desktop, 2 columnas mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 w-full">
            {diario?.posts?.map((post: any) => (
              <a
                key={post._key}
                href={post.linkPost || diario.urlInstagram || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-surface-container-lowest border border-outline-variant/5"
              >
                {post.tipo === 'video' && post.videoUrl ? (
                  <video
                    src={post.videoUrl}
                    autoPlay muted loop playsInline
                    className="w-full h-full object-cover"
                  />
                ) : post.imagen?.asset?.url ? (
                  <Image
                    src={post.imagen.asset.url}
                    alt={post.descripcion || 'Diario del Taller'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : null}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <svg className="w-8 h-8 text-on-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  {post.descripcion && (
                    <p className="text-on-primary text-xs font-serif italic mb-2 line-clamp-3">
                      "{post.descripcion}"
                    </p>
                  )}
                  <span className="text-[10px] tracking-[0.3em] font-bold text-on-primary uppercase" style={{ fontFamily: 'var(--font-label)' }}>VER POST</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
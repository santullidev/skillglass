import { client, urlFor } from '@/lib/sanity'
import { HOME_CONFIG_QUERY, PRODUCTOS_QUERY } from '@/lib/queries'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import CollectionCard from '@/components/CollectionCard'
import HeroSlider from '@/components/HeroSlider'
import type { HomeConfig, Producto } from '@/types/producto'

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
    { label: 'PROCESO', valor: 'VITROFUSIÓN' },
  ],
  procesoEtiqueta: 'LA TÉCNICA',
  procesoTitulo: 'La Tensión de la Llama',
  procesoPasos: [
    { titulo: 'Pulso y Soplete', descripcion: 'Llevamos varillas de cristal puro a su punto de fusión exacto, dominando una llama viva para que obedezca al pulso de nuestras manos.' },
    { titulo: 'Sin Moldes', descripcion: 'La forma final de cada anillo o joya es dictada por la tensión superficial y nuestro control de la gravedad. Ninguna pieza es idéntica a otra.' },
    { titulo: 'Templado Íntimo', descripcion: 'Tras ser esculpidas en el fuego, las piezas reposan en un meticuloso proceso de templado artesanal para garantizar su resistencia eterna.' },
    { titulo: 'Luz Vestible', descripcion: 'Diseñamos prismas orgánicos. Creados no solo como accesorios, sino como piezas que interactúan con la refracción lumínica sobre tu piel.' },
  ],
}

export default async function Home() {
  const config = await client.fetch<HomeConfig>(HOME_CONFIG_QUERY)
  const fallbackProductos = await client.fetch<Producto[]>(PRODUCTOS_QUERY)

  // Resolución de todos los textos: primero Sanity, luego fallback
  const heroTitle = config?.tituloPrincipal || DEFAULTS.heroTitle
  const heroSubtitle = config?.subtituloHero || DEFAULTS.heroSubtitle
  const tituloColecciones = config?.tituloColecciones || DEFAULTS.tituloColecciones
  const frase = config?.seccionFrase?.frase || DEFAULTS.frase
  const mostrarFrase = config?.seccionFrase?.activo !== false
  const tituloPiezas = config?.tituloPiezasDestacadas || DEFAULTS.tituloPiezasDestacadas

  // Proceso
  const proceso = config?.seccionProceso
  const mostrarProceso = proceso?.activo !== false
  const procesoEtiqueta = proceso?.etiqueta || DEFAULTS.procesoEtiqueta
  const procesoTitulo = proceso?.titulo || DEFAULTS.procesoTitulo
  const procesoPasos = proceso?.pasos && proceso.pasos.length > 0 ? proceso.pasos : DEFAULTS.procesoPasos

  // Alquimia
  const alquimia = config?.seccionAlquimia
  const alquimiaEtiqueta = alquimia?.etiqueta || DEFAULTS.alquimiaEtiqueta
  const alquimiaSpecs = alquimia?.specs && alquimia.specs.length > 0 ? alquimia.specs : DEFAULTS.alquimiaSpecs

  // Pillares: usamos los pasos configurados o los de fallback
  const pilares = procesoPasos || []

  // Productos
  const productos = config?.productosDestacados && config.productosDestacados.length > 0
    ? config.productosDestacados
    : fallbackProductos

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <HeroSlider
        images={config?.heroImages}
        metadata={config?.heroMetadata}
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {/* ── COLECCIONES ───────────────────────────────────────── */}
      {config?.coleccionesDestacadas && config.coleccionesDestacadas.length > 0 && (
        <section id="colecciones" className="py-24 lg:py-40 px-6 lg:px-8 max-w-360 mx-auto w-full relative">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 relative z-10">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-primary uppercase mb-6" style={{ fontFamily: 'var(--font-label)' }}>
                COLECCIONES
              </p>
              <h2
                className="text-5xl lg:text-6xl xl:text-7xl text-on-surface max-w-2xl leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {tituloColecciones}
              </h2>
            </div>
            <Link
              href="/colecciones"
              className="group inline-flex items-center gap-3 text-[10px] tracking-[0.3em] text-primary uppercase border-b border-primary/30 pb-2 hover:border-primary transition-all duration-300"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Ver Todas las Colecciones
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </div>
          {/* Glass framing line */}
          <div className="w-full h-px bg-linear-to-r from-outline-variant/5 via-outline-variant/30 to-outline-variant/5 mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {config.coleccionesDestacadas.map((coleccion) => (
              <CollectionCard key={coleccion._id} coleccion={coleccion} />
            ))}
          </div>
        </section>
      )}

      {/* ── PIEZA DESTACADA (ALQUIMIA) ────────────────────────── */}
      {alquimia?.activo && (
        <section className="py-24 lg:py-40 bg-surface-lowest relative overflow-hidden border-y border-outline-variant/10">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-tertiary/10 blur-[150px] mix-blend-screen pointer-events-none" />
          
          <div className="max-w-360 mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

              {/* Izquierda: Fichas técnicas (High Tech Style) */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="flex flex-col gap-16 border-l pl-8 border-outline-variant/30">
                  {alquimiaSpecs.map((spec, i) => (
                    <div key={i} className="flex flex-col gap-3 relative group">
                      <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 w-4 h-px bg-primary/50 group-hover:bg-primary transition-colors" />
                      <span
                        className="text-[9px] tracking-[0.4em] text-primary/60 font-bold uppercase"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        {spec.label}
                      </span>
                      <span className="text-3xl text-on-surface font-serif italic text-shadow-sm group-hover:text-primary transition-colors duration-500">
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
                <p className="text-[10px] tracking-[0.4em] text-primary uppercase mb-8" style={{ fontFamily: 'var(--font-label)' }}>
                  {alquimiaEtiqueta}
                </p>
                <h3
                  className="text-5xl lg:text-6xl text-on-surface mb-10 leading-[1.1]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {alquimia.producto?.nombre || 'La Alquimia del Cristal'}
                </h3>
                <p className="text-on-surface/70 font-serif leading-relaxed text-lg mb-12">
                  {alquimia.producto?.descripcion || 'Una exhibición de la maravilla del cristal. Esta pieza requirió mantener un pulso inquebrantable frente a la flama viva, resolviendo su propia geometría orgánica antes del enfriamiento final.'}
                </p>
                {alquimia.producto && (
                  <Link
                    href={`/productos/${alquimia.producto.slug}`}
                    className="group inline-flex border border-outline-variant/50 text-on-surface py-4 px-8 uppercase tracking-[0.3em] text-[10px] hover:border-primary transition-all duration-500 overflow-hidden relative bg-surface-lowest"
                    style={{ fontFamily: 'var(--font-label)' }}
                  >
                    <div className="absolute inset-x-0 bottom-0 h-full bg-surface-container origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out z-0" />
                    <span className="relative z-10 font-bold group-hover:text-primary transition-colors">
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
        <section className="py-32 lg:py-48 bg-surface-lowest relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_50%)] opacity-5 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] text-[400px] text-surface-container opacity-20 font-serif leading-none select-none pointer-events-none">
            &ldquo;
          </div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <p className="text-2xl md:text-3xl lg:text-4xl leading-[1.6] text-on-surface/90 font-serif italic drop-shadow-lg text-balance">
              {frase}
            </p>
            <div className="mt-16 inline-flex flex-col items-center gap-4">
              <span className="w-px h-12 bg-primary/50" />
              <span className="text-[10px] tracking-[0.5em] text-primary/80 uppercase" style={{ fontFamily: 'var(--font-label)' }}>SKILGLASS</span>
            </div>
          </div>
        </section>
      )}

      {/* ── NARRATIVA / PILARES (legacy seccionNarrativa) ────── */}
      {config?.seccionNarrativa?.activo && (
        <section className="py-24 lg:py-40 bg-surface-lowest">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-24 items-start mb-32">
              <div className="lg:max-w-2xl">
                <h2
                  className="text-5xl lg:text-7xl text-on-surface mb-12 leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {config.seccionNarrativa.titulo || 'El Caos Controlado del Fuego'}
                </h2>
                <p className="text-xl text-on-surface-variant font-serif leading-relaxed italic">
                  {config.seccionNarrativa.descripcion || 'Cada pieza de SKILGLASS atraviesa un riguroso proceso de transformación molecular. No fabricamos joyería; capturamos un momento de fluidez sólida.'}
                </p>
              </div>
              <div className="w-full lg:w-px lg:h-64 bg-outline-variant/30" />
            </div>
            {config.seccionNarrativa.features && config.seccionNarrativa.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/20 border border-outline-variant/20">
                {config.seccionNarrativa.features.map((feature, i) => (
                  <div key={i} className="bg-surface p-10 hover:bg-surface-container transition-all duration-500 group">
                    <span
                      className="text-primary/40 text-xs font-bold mb-8 block"
                      style={{ fontFamily: 'var(--font-label)' }}
                    >
                      0{i + 1} {'//'}
                    </span>
                    <h4
                      className="text-xl text-on-surface mb-4 group-hover:text-primary transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {feature.titulo}
                    </h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      {feature.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PRODUCTOS DESTACADOS ──────────────────────────────── */}
      <section id="piezas" className="py-32 lg:py-48 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent" />
        
        {/* Section Header — editorial, off-center */}
        <div className="max-w-360 mx-auto px-6 lg:px-8 mb-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
            <div className="relative">
              <div className="absolute -left-6 top-2 bottom-0 w-px bg-primary/30 hidden md:block" />
              <p
                className="text-[10px] tracking-[0.4em] text-primary uppercase mb-6"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                Sala de exposición
              </p>
              <h2
                className="text-6xl lg:text-8xl text-on-surface leading-none tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {tituloPiezas}
              </h2>
            </div>
            <div className="lg:max-w-sm lg:pb-3 border-l border-outline-variant/20 pl-6">
              <p className="text-on-surface/70 font-serif italic text-lg leading-relaxed mb-6">
                Joyería que nace de la pura destreza térmica. Un catálogo donde el asombro artesanal se encuentra con la fluidez del cristal soplado a la flama.
              </p>
              <Link
                href="/productos"
                className="group inline-flex items-center gap-3 text-[9px] tracking-[0.3em] text-on-surface uppercase border-b border-primary/30 pb-2 hover:border-primary transition-all duration-300"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                Ingresar al catálogo completo
                <span className="text-primary group-hover:translate-x-2 transition-transform duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid — Chunks asimétricos alternantes */}
        {productos.length > 0 && (() => {
          // Agrupar en chunks de 3
          const chunks: Producto[][] = []
          for (let i = 0; i < productos.length; i += 3) {
            chunks.push(productos.slice(i, i + 3))
          }

          return (
            <div className="max-w-360 mx-auto px-6 lg:px-8">
              <div className="border border-outline-variant/10 divide-y divide-outline-variant/10 shadow-2xl shadow-black/20">
              {chunks.map((chunk, chunkIdx) => {
                const isReversed = chunkIdx % 2 === 1
                const offset = chunkIdx * 3

                // 1 producto: full ancho featured
                if (chunk.length === 1) return (
                  <div key={chunkIdx}>
                    <ProductCard producto={chunk[0]} index={offset} variant="featured" />
                  </div>
                )

                // 2 productos: mitad y mitad
                if (chunk.length === 2) return (
                  <div key={chunkIdx} className="grid grid-cols-1 md:grid-cols-2 divide-x divide-outline-variant/10">
                    <ProductCard producto={chunk[0]} index={offset} variant="tall" />
                    <ProductCard producto={chunk[1]} index={offset + 1} variant="tall" />
                  </div>
                )

                // 3 productos: asimétrico 8+4 / 4+8 alternado
                // "stacked" = h-[35vh] × 2 = 70vh = featured height
                const featured = isReversed ? chunk[2] : chunk[0]
                const s1 = isReversed ? chunk[0] : chunk[1]
                const s2 = isReversed ? chunk[1] : chunk[2]
                const fi = isReversed ? offset + 2 : offset
                const s1i = isReversed ? offset : offset + 1
                const s2i = isReversed ? offset + 1 : offset + 2

                return (
                  <div key={chunkIdx} className="grid grid-cols-1 md:grid-cols-12 divide-x divide-outline-variant/10">
                    {isReversed ? (
                      <>
                        {/* Stack izquierdo */}
                        <div className="md:col-span-4 divide-y divide-outline-variant/10">
                          <ProductCard producto={s1} index={s1i} variant="stacked" />
                          <ProductCard producto={s2} index={s2i} variant="stacked" />
                        </div>
                        {/* Featured derecho */}
                        <div className="md:col-span-8">
                          <ProductCard producto={featured} index={fi} variant="featured" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Featured izquierdo */}
                        <div className="md:col-span-8">
                          <ProductCard producto={featured} index={fi} variant="featured" />
                        </div>
                        {/* Stack derecho */}
                        <div className="md:col-span-4 divide-y divide-outline-variant/10">
                          <ProductCard producto={s1} index={s1i} variant="stacked" />
                          <ProductCard producto={s2} index={s2i} variant="stacked" />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
              </div>
            </div>
          )
        })()}

        {/* Tagline footer */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 flex items-center gap-6">
          <span className="flex-1 h-px bg-outline-variant/20" />
          <p
            className="text-[10px] tracking-[0.4em] text-outline-variant/40 uppercase shrink-0"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            La Alquimia de la Luz Molten · Buenos Aires
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
              {proceso?.imagen ? (
                <Image
                  src={urlFor(proceso.imagen).width(1200).height(1400).url()}
                  alt="Proceso de vitrofusión"
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
                className="text-[10px] tracking-[0.5em] text-primary uppercase mb-6"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                {procesoEtiqueta}
              </p>

              {/* Título grande */}
              <h2
                className="text-5xl lg:text-6xl xl:text-7xl text-on-surface leading-none mb-10"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {procesoTitulo}
              </h2>

              {/* Frase / Cita principal */}
              {(proceso?.descripcion || true) && (
                <p className="text-lg text-on-surface-variant font-serif italic leading-relaxed mb-12 max-w-lg border-l-2 border-primary/30 pl-6">
                  {proceso?.descripcion || 'Olvida la producción en masa. Cada joya de SKILGLASS es esculpida individualmente mediante la pura técnica del soplado a la flama. El artesano manipula el calor y el cristal líquido, moldeando la gota incandescente con precisión quirúrgica antes de que el aire la solidifique.'}
                </p>
              )}

              {/* Lista de pilares */}
              {pilares.length > 0 && (
                <div className="space-y-6 mb-12">
                  {pilares.map((feature, i) => (
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
                href={proceso?.ctaLink || '/colecciones'}
                className="group self-start inline-flex items-center gap-4 text-[11px] tracking-[0.4em] text-on-surface uppercase border border-outline-variant/30 px-8 py-4 hover:border-primary hover:text-primary transition-all duration-500 overflow-hidden relative"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <span className="relative z-10">{proceso?.ctaTexto || 'Conocer el Estudio'}</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
                <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-surface-container transition-transform duration-500 ease-out" />
              </Link>
            </div>
          </div>

          {/* ── PARTE INFERIOR: Pasos del proceso ── */}
          {procesoPasos.length > 0 && (
            <div className="border-t border-outline-variant/10">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/10">
                  {procesoPasos.map((step, i) => (
                    <div key={i} className="px-0 sm:px-8 py-8 sm:py-0 first:pl-0">
                      <span
                        className="text-primary/40 text-xs font-bold tracking-[0.3em] mb-4 block"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        {String(i + 1).padStart(2, '0')} {'//'}
                      </span>
                      <h3
                        className="text-lg text-on-surface mb-3"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {step.titulo}
                      </h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {step.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </section>
      )}

      {/* ── SECCIÓN INSTAGRAM (PLACEHOLDERS) ───────────────────── */}
      <section className="pt-24 border-t border-outline-variant/10 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 flex flex-col items-center text-center">
          <p
            className="text-[10px] tracking-[0.4em] text-primary uppercase mb-4"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Diario del Taller
          </p>
          <h2
            className="text-4xl lg:text-5xl text-on-surface mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            @skilglass
          </h2>
          <a href="#" className="group inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-colors border-b border-primary/20 pb-1">
            Síguenos en la red
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Feed Grid: 4 columnas desktop, 2 columnas mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <a key={i} href="#" className="group relative aspect-square overflow-hidden bg-surface-container-lowest border border-outline-variant/5">
              <Image 
                src={`https://placehold.co/600x600/170f10/a9c7ff?text=IG+POST+0${i}&font=Playfair+Display`} 
                alt={`Instagram placeholder ${i}`}
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 mix-blend-lighten"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
                <svg className="w-8 h-8 text-on-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="text-xs tracking-widest text-on-primary" style={{ fontFamily: 'var(--font-label)' }}>VER POST</span>
              </div>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}
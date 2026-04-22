import { client, urlFor } from '@/lib/sanity'
import { PRODUCTO_BY_SLUG_QUERY, PRODUCTOS_QUERY, SETTINGS_QUERY, PRODUCT_CONFIG_QUERY } from '@/lib/queries'
import Link from 'next/link'
import WhatsAppButton from '@/components/WhatsAppButton'
import { notFound } from 'next/navigation'
import type { Producto } from '@/types/producto'
import type { Metadata } from 'next'
import BuyButton from '@/components/BuyButton'
import AddToCartButton from '@/components/AddToCartButton'
import ImageCarousel from '@/components/ImageCarousel'

// ISR: regenerar la página cada 60 segundos para reflejar cambios de stock en Sanity
export const revalidate = 60

export async function generateStaticParams() {
  const productos: Producto[] = await client.fetch(PRODUCTOS_QUERY)
  return productos.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const { slug } = resolvedParams

  const producto: Producto = await client.fetch(PRODUCTO_BY_SLUG_QUERY, {
    slug,
  })

  if (!producto) return { title: 'Producto No Encontrado' }

  return {
    title: `${producto.nombre} | SKILGLASS`,
    description: producto.descripcion || `Adquiere ${producto.nombre}, una joya única de autor. Joyería en vidrio SKILGLASS.`,
    openGraph: {
      title: `${producto.nombre} | SKILGLASS`,
      description: producto.descripcion || `Pieza única de joyería artesanal esculpida al fuego.`,
      images: producto.imagenes?.[0]
        ? [urlFor(producto.imagenes[0]).width(1200).height(630).url()]
        : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producto.nombre} | SKILGLASS`,
      description: producto.descripcion || `Joyas esculpidas por el fuego.`,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const { slug } = resolvedParams

  const [producto, settings, config] = await Promise.all([
    client.fetch(PRODUCTO_BY_SLUG_QUERY, { slug }),
    client.fetch(SETTINGS_QUERY),
    client.fetch(PRODUCT_CONFIG_QUERY)
  ]) as [Producto, { telefono?: string }, any]

  if (!producto) {
    notFound()
  }

  // Use the first image for AddToCart reference
  const firstImageUrl = producto.imagenes?.[0] ? urlFor(producto.imagenes[0]).width(400).height(400).url() : ''

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant mb-12" style={{ fontFamily: 'var(--font-label)' }}>
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface">{config?.breadcrumbText || 'Pieza Única'}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <ImageCarousel images={producto.imagenes || []} alt={producto.nombre} />
          
          <p className="text-xs text-on-surface-variant text-center tracking-widest uppercase mt-4" style={{ fontFamily: 'var(--font-label)' }}>
            {config?.galleryHelpText || 'Zoom disponible • Arrastrar para rotar'}
          </p>
        </div>

        {/* Right: Info Panel (6 cols) */}
        <div className="lg:col-span-6 flex flex-col pt-4 lg:pt-12">
          
          <div className="mb-8 relative">
            <div className="absolute -left-8 top-4 w-1 h-24 bg-primary/30 hidden lg:block" />
            
            <p className="text-secondary text-xs tracking-[0.2em] font-bold uppercase mb-4" style={{ fontFamily: 'var(--font-label)' }}>
              {config?.tagText || 'Pieza Única e Irrepetible'}
            </p>

            <h1 className="text-4xl lg:text-5xl text-on-surface mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {producto.nombre}
            </h1>
            <p className="text-2xl text-tertiary tracking-wider" style={{ fontFamily: 'var(--font-label)' }}>
              {producto.precio ? `$ ${producto.precio.toLocaleString('es-AR')} ARS` : 'Precio a consultar'}
            </p>
          </div>

          <div className="prose prose-invert prose-p:text-on-surface-variant prose-p:font-serif prose-p:leading-relaxed mb-12">
            <p>
              {producto.descripcion || 'Pieza única creada mediante el proceso de joyería en vidrio a alta temperatura.'}
            </p>
          </div>

          {/* Technical Specs Bento-style */}
          <div className="grid grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20 mb-12 text-sm" style={{ fontFamily: 'var(--font-label)' }}>
            <div className="bg-surface p-4 flex flex-col gap-1 hover:bg-surface-container transition-colors">
              <span className="text-outline-variant text-[10px] tracking-widest uppercase">Técnica</span>
              <span className="text-on-surface">{config?.tecnicaGeneral || 'Fusión 820°C'}</span>
            </div>
            <div className="bg-surface p-4 flex flex-col gap-1 hover:bg-surface-container transition-colors">
              <span className="text-outline-variant text-[10px] tracking-widest uppercase">Stock</span>
              <span className="text-on-surface">{producto.disponible ? 'Pieza de Autor / 1 unidad' : 'Agotado'}</span>
            </div>
            <div className="bg-surface p-4 flex flex-col gap-1 hover:bg-surface-container transition-colors">
              <span className="text-outline-variant text-[10px] tracking-widest uppercase">Material</span>
              <span className="text-on-surface">{config?.materialGeneral || 'Cristal Spectrum / Plata 925'}</span>
            </div>
            <div className="bg-surface p-4 flex flex-col gap-1 hover:bg-surface-container transition-colors">
              <span className="text-outline-variant text-[10px] tracking-widest uppercase">Envío</span>
              <span className="text-primary">{config?.envioGeneral || 'Eco-Global Express'}</span>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            {producto.disponible ? (
              <>
                <AddToCartButton
                  id={producto._id}
                  nombre={producto.nombre}
                  slug={producto.slug}
                  precio={producto.precio || 0}
                  imagenUrl={firstImageUrl}
                  numeroCertificado={producto.numeroCertificado}
                  peso={producto.peso}
                />
                <BuyButton 
                  id={producto._id}
                  nombre={producto.nombre}
                  precio={producto.precio || 0}
                  slug={producto.slug}
                  imagenUrl={firstImageUrl}
                  numeroCertificado={producto.numeroCertificado}
                  peso={producto.peso}
                />
              </>
            ) : (
              <div className="border border-outline-variant text-on-surface-variant py-4 px-6 text-center text-sm tracking-widest uppercase line-through" style={{ fontFamily: 'var(--font-label)' }}>
                {config?.outOfStockText || 'Pieza no disponible'}
              </div>
            )}
            
            <WhatsAppButton 
              producto={producto.nombre} 
              phone={settings?.telefono}
            />
          </div>

          {/* Sello de Autenticidad / Pieza Única */}
          <div className="mb-12 p-8 border border-gold/30 bg-surface-deep relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.5em] text-gold font-bold uppercase" style={{ fontFamily: 'var(--font-label)' }}>
                  Certificado de Unicidad
                </span>
                {producto.numeroCertificado && (
                  <span className="text-gold/80 font-mono tracking-[0.3em] font-bold text-[12px]">
                    № {producto.numeroCertificado}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-2xl text-on-surface font-serif italic">{config?.certificadoTitulo || 'Pieza Única e Irrepetible'}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {config?.certificadoTexto || 'Esta obra ha sido esculpida mediante transformación térmica directa. Debido a la naturaleza orgánica del cristal fundido, las tensiones moleculares y la gravedad han dictado una forma final que es técnicamente imposible de replicar con exactitud.'}
                </p>
              </div>
              <div className="pt-4 border-t border-gold/10 flex items-center justify-between">
                <span className="text-[9px] tracking-[0.2em] text-gold/60 uppercase" style={{ fontFamily: 'var(--font-label)' }}>{config?.firmaEstudio || 'Estudio Skilglass Ar'}</span>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <span key={i} className="w-1 h-1 bg-gold rounded-full opacity-40" />)}
                </div>
              </div>
            </div>
            {/* Background texture simulation */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>

          <div className="mb-12 flex flex-col items-start gap-4 p-6 bg-surface-container-low border border-outline-variant/10">
            {/* Flame Drop Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary/80">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 20C9.23858 20 7 17.7614 7 15C7 11.233 11 5.378 12 4.072C13 5.378 17 11.233 17 15C17 17.7614 14.7614 20 12 20ZM12 11C10.8954 11 10 11.8954 10 13C10 13.926 10.6358 14.7001 11.5 14.9312V11H12V18.91C13.6826 18.4312 15 16.866 15 15C15 12.7909 13.2091 11 12 11Z"/>
            </svg>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] tracking-widest uppercase text-on-surface" style={{ fontFamily: 'var(--font-label)' }}>
                {config?.procesoIconoTitulo || 'Soplado a la Flama'}
              </span>
              <span className="text-on-surface-variant text-sm font-serif leading-relaxed">
                {config?.procesoIconoTexto || 'Cristal esculpido directamente bajo la tensión térmica del soplete.'}
              </span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-t border-outline-variant/20 pt-8 mt-auto">
            <ul className="space-y-4 text-sm text-on-surface-variant font-serif">
              {(config?.garantias || [
                {
                  _key: 'def-1',
                  titulo: 'Certificado de Autenticidad',
                  descripcion: 'Cada pieza se entrega con un certificado firmado a mano que garantiza su origen artesanal en nuestro estudio y su carácter de pieza única.'
                },
                {
                  _key: 'def-2',
                  titulo: 'Packaging Artesanal',
                  descripcion: 'Estuche de lino orgánico y caja rígida de diseño minimalista con sello de marca en relieve.'
                }
              ]).map((g: any) => (
                <li key={g._key || g.titulo} className="flex items-start gap-3">
                  <span className="text-primary mt-1">✧</span>
                  <p><strong>{g.titulo}:</strong> {g.descripcion}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      
      {/* Divider */}
      <div className="w-full h-px bg-linear-to-r from-transparent via-outline-variant/30 to-transparent my-24" />

      {/* Quote */}
      <div className="max-w-3xl mx-auto text-center px-4">
        <p className="text-2xl md:text-3xl text-on-surface font-serif italic leading-relaxed">
          &ldquo;{config?.fraseFinal || 'El cristal no olvida. La curva de temperatura que le dimos ayer dictará cómo refracta la luz hoy.'}&rdquo;
        </p>
      </div>

    </div>
  )
}
export interface Producto {
  _id: string
  nombre: string
  slug: string
  precio: number
  descripcion?: string
  disponible: boolean
  esEdicionLimitada?: boolean
  imagenes: SanityImage[]
}

export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: object
}

export interface ProductoEnColeccion {
  _key: string
  producto: Producto
  tamanoGrilla: 'normal' | 'doble_ancho' | 'doble_alto' | 'destacado'
}

export interface Coleccion {
  _id: string
  nombre: string
  slug: string
  descripcion?: string
  descripcionLarga?: string
  imagenes: SanityImage[]
  productos: ProductoEnColeccion[]
}

export interface HeroMetadata {
  piezaId?: string
  referencia?: string
}

export interface AlquimiaSpec {
  label: string
  valor: string
}

export interface SeccionAlquimia {
  activo: boolean
  etiqueta?: string
  producto?: Producto
  specs?: AlquimiaSpec[]
}

export interface SeccionFrase {
  activo: boolean
  frase?: string
}

export interface ProcesoPaso {
  titulo: string
  descripcion: string
}

export interface ProcesoFeature {
  titulo: string
  descripcion: string
}

export interface SeccionProceso {
  activo: boolean
  imagen?: SanityImage
  etiqueta?: string
  titulo?: string
  descripcion?: string
  pasos?: ProcesoPaso[]
  features?: ProcesoFeature[]
  ctaTexto?: string
  ctaLink?: string
}

// Legacy — kept for backwards GROQ compatibility
export interface SeccionNarrativa {
  activo: boolean
  titulo: string
  descripcion?: string
  features?: { titulo: string; descripcion: string }[]
}

export interface HomeConfig {
  _id: string
  // Hero
  heroImages?: SanityImage[]
  heroMetadata?: HeroMetadata
  tituloPrincipal?: string
  subtituloHero?: string
  // Colecciones
  tituloColecciones?: string
  coleccionesDestacadas: Coleccion[]
  // Pieza destacada
  seccionAlquimia?: SeccionAlquimia
  // Frase editorial
  seccionFrase?: SeccionFrase
  // Productos
  tituloPiezasDestacadas?: string
  productosDestacados: Producto[]
  // Proceso
  seccionProceso?: SeccionProceso
  // Legacy
  seccionNarrativa?: SeccionNarrativa
}

export interface Settings {
  email?: string
  telefono?: string
  direccion?: string
  instagram?: string
}

export interface SoporteSeccion {
  id: string
  titulo: string
  contenido: string
}

export interface FAQ {
  pregunta: string
  respuesta: string
}

export interface SoporteConfig {
  titulo: string
  subtitulo?: string
  secciones: SoporteSeccion[]
  faqs: FAQ[]
}
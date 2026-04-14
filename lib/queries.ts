import { defineQuery } from 'next-sanity'

export const PRODUCTOS_QUERY = defineQuery(`
  *[_type == "producto"] | order(_createdAt desc) {
    _id,
    nombre,
    "slug": slug.current,
    precio,
    descripcion,
    disponible,
    esEdicionLimitada,
    categoria,
    imagenes,
    numeroCertificado
  }
`)

export const PRODUCTO_BY_SLUG_QUERY = defineQuery(`
  *[_type == "producto" && slug.current == $slug][0] {
    _id,
    nombre,
    "slug": slug.current,
    precio,
    descripcion,
    disponible,
    esEdicionLimitada,
    imagenes,
    numeroCertificado
  }
`)

export const COLECCIONES_QUERY = defineQuery(`
  *[_type == "coleccion"] | order(_createdAt desc) {
    _id,
    nombre,
    "slug": slug.current,
    descripcion,
    descripcionLarga,
    imagenes,
    productos[]{
      _key,
      tamanoGrilla,
      "producto": producto->{
        _id,
        nombre,
        "slug": slug.current,
        precio,
        imagenes,
        numeroCertificado
      }
    }
  }
`)

export const COLECCION_BY_SLUG_QUERY = defineQuery(`
  *[_type == "coleccion" && slug.current == $slug][0] {
    _id,
    nombre,
    "slug": slug.current,
    descripcion,
    descripcionLarga,
    imagenes,
    productos[]{
      _key,
      tamanoGrilla,
      "producto": producto->{
        _id,
        nombre,
        "slug": slug.current,
        precio,
        imagenes,
        numeroCertificado
      }
    }
  }
`)

export const HOME_CONFIG_QUERY = defineQuery(`
  *[_type == "homeConfig"][0] {
    _id,
    heroImages,
    heroMetadata,
    tituloPrincipal,
    subtituloHero,
    tituloColecciones,
    coleccionesDestacadas[]->{
      _id,
      nombre,
      "slug": slug.current,
      descripcion,
      imagenes,
      productos[]{
        _key,
        tamanoGrilla,
        "producto": producto->{
          _id,
          nombre,
          "slug": slug.current,
          precio,
          imagenes,
          numeroCertificado
        }
      }
    },
    seccionAlquimia {
      activo,
      etiqueta,
      producto->{
        _id,
        nombre,
        "slug": slug.current,
        precio,
        descripcion,
        imagenes,
        numeroCertificado
      },
      specs
    },
    seccionFrase {
      activo,
      frase
    },
    tituloPiezasDestacadas,
    productosDestacados[]->{
      _id,
      nombre,
      "slug": slug.current,
      precio,
      imagenes,
      numeroCertificado
    },
    seccionProceso {
      activo,
      imagen,
      etiqueta,
      titulo,
      descripcion,
      pasos,
      features,
      ctaTexto,
      ctaLink
    },
    seccionNarrativa {
      activo,
      titulo,
      descripcion,
      features
    }
  }
`)

export const PRODUCT_CONFIG_QUERY = defineQuery(`
  *[_type == "productoConfig"][0] {
    breadcrumbText,
    galleryHelpText,
    tagText,
    outOfStockText,
    tecnicaGeneral,
    materialGeneral,
    envioGeneral,
    certificadoTitulo,
    certificadoTexto,
    firmaEstudio,
    procesoIconoTitulo,
    procesoIconoTexto,
    garantias,
    fraseFinal
  }
`)

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "settings"][0] {
    email,
    telefono,
    direccion,
    instagram
  }
`)

export const SOPORTE_QUERY = defineQuery(`
  *[_type == "soporte"][0] {
    titulo,
    subtitulo,
    secciones[] {
      titulo,
      contenido,
      id
    },
    faqs[] {
      pregunta,
      respuesta
    }
  }
`)
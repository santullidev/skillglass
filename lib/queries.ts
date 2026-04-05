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
    imagenes
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
    imagenes
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
        imagenes
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
        imagenes
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
      imagenes
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
        imagenes
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
      imagenes
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
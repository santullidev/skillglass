import { defineQuery } from 'next-sanity'

export const PRODUCTOS_QUERY = defineQuery(`
  *[_type == "producto"] | order(_createdAt desc) {
    _id,
    nombre,
    "slug": slug.current,
    precio,
    descripcion,
    disponible,
    categoria,
    imagenes,
    numeroCertificado,
    peso
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
    categoria,
    imagenes,
    numeroCertificado,
    peso
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
        numeroCertificado,
        peso
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
        numeroCertificado,
        peso
      }
    }
  }
`)


export const HERO_CONFIG_QUERY = defineQuery(`
  *[_type == "heroConfig" && _id == "heroConfig"][0] {
    fotosPortada,
    tituloHero,
    subtituloHero,
    metadata,
    ctaTexto,
    ctaLink
  }
`)

export const CAPSULAS_SECTION_QUERY = defineQuery(`
  *[_type == "capsulasSectionConfig" && _id == "capsulasSectionConfig"][0] {
    tituloSeccionColecciones,
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
    }
  }
`)

export const ALQUIMIA_SECTION_QUERY = defineQuery(`
  *[_type == "alquimiaSectionConfig" && _id == "alquimiaSectionConfig"][0] {
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
  }
`)

export const FRASE_SECTION_QUERY = defineQuery(`
  *[_type == "fraseSectionConfig" && _id == "fraseSectionConfig"][0] {
    activo,
    fraseEditorial,
    autorFrase
  }
`)

export const PRODUCTOS_SECTION_QUERY = defineQuery(`
  *[_type == "productosSectionConfig" && _id == "productosSectionConfig"][0] {
    tituloSeccionProductos,
    productosDestacados[]->{
      _id,
      nombre,
      "slug": slug.current,
      precio,
      imagenes,
      numeroCertificado
    }
  }
`)

export const PROCESO_SECTION_QUERY = defineQuery(`
  *[_type == "procesoSectionConfig" && _id == "procesoSectionConfig"][0] {
    activo,
    imagen,
    etiqueta,
    tituloProceso,
    descripcion,
    paso1Titulo,
    paso1Descripcion,
    paso2Titulo,
    paso2Descripcion,
    paso3Titulo,
    paso3Descripcion,
    paso4Titulo,
    paso4Descripcion,
    ctaTexto,
    ctaLink
  }
`)

export const HOME_ESTUDIO_SECTION_QUERY = defineQuery(`
  *[_type == "homeEstudioSectionConfig" && _id == "homeEstudioSectionConfig"][0] {
    activo,
    titulo,
    descripcion,
    imagen,
    ctaTexto,
    ctaLink
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
    horario,
    contactoTitulo,
    contactoTexto,
    "instagram": *[_type == "diarioTaller" && _id == "diarioTaller-singleton"][0].urlInstagram
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

export const DIARIO_TALLER_QUERY = defineQuery(`
  *[_type == "diarioTaller" && _id == "diarioTaller-singleton"][0]{
    titulo,
    handle,
    urlInstagram,
    activo,
    posts[]{
      _key,
      tipo,
      imagen{ asset->{ url } },
      "videoUrl": video.asset->url,
      descripcion,
      linkPost
    }
  }
`)
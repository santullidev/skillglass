import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'obhj76tx',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function migrar() {
  console.log('🚀 Iniciando migración de Home Config...');

  const homeConfig = await client.fetch('*[_type == "homeConfig"][0]');

  if (!homeConfig) {
    console.error('❌ No se encontró el documento homeConfig original.');
    return;
  }

  console.log('📦 Datos originales encontrados. Fraccionando...');

  const docs = [
    // 1 · Hero
    {
      _id: 'heroConfig',
      _type: 'heroConfig',
      fotosPortada: homeConfig.heroImages || [],
      tituloHero: homeConfig.tituloPrincipal || 'Joyas de Autor',
      subtituloHero: homeConfig.subtituloHero || '',
      metadata: homeConfig.heroMetadata || {},
      ctaTexto: homeConfig.ctaTexto || 'Explorar Piezas',
      ctaLink: homeConfig.ctaLink || '/productos',
    },
    // 2 · Cápsulas
    {
      _id: 'capsulasSectionConfig',
      _type: 'capsulasSectionConfig',
      tituloSeccionColecciones: homeConfig.tituloColecciones || 'Series Conceptuales',
      coleccionesDestacadas: homeConfig.coleccionesDestacadas || [],
    },
    // 3 · Alquimia
    {
      _id: 'alquimiaSectionConfig',
      _type: 'alquimiaSectionConfig',
      activo: homeConfig.seccionAlquimia?.activo ?? true,
      etiqueta: homeConfig.seccionAlquimia?.etiqueta || 'CURACIÓN TÉCNICA',
      producto: homeConfig.seccionAlquimia?.producto || null,
      specs: homeConfig.seccionAlquimia?.specs || [],
    },
    // 4 · Frase
    {
      _id: 'fraseSectionConfig',
      _type: 'fraseSectionConfig',
      activo: homeConfig.seccionFrase?.activo ?? true,
      fraseEditorial: homeConfig.seccionFrase?.frase || '',
      autorFrase: 'SKILGLASS',
    },
    // 5 · Productos
    {
      _id: 'productosSectionConfig',
      _type: 'productosSectionConfig',
      tituloSeccionProductos: homeConfig.tituloPiezasDestacadas || 'Piezas Destacadas',
      productosDestacados: homeConfig.productosDestacados || [],
    },
    // 6 · Proceso
    {
      _id: 'procesoSectionConfig',
      _type: 'procesoSectionConfig',
      activo: homeConfig.seccionProceso?.activo ?? true,
      imagen: homeConfig.seccionProceso?.imagen || null,
      etiqueta: homeConfig.seccionProceso?.etiqueta || 'LA TÉCNICA',
      tituloProceso: homeConfig.seccionProceso?.titulo || 'La Tensión de la Llama',
      descripcion: homeConfig.seccionProceso?.descripcion || '',
      pasosProceso: homeConfig.seccionProceso?.pasos || [],
      ctaTexto: homeConfig.seccionProceso?.ctaTexto || '',
      ctaLink: homeConfig.seccionProceso?.ctaLink || '',
    },
  ];

  for (const doc of docs) {
    console.log(`✨ Creando/Actualizando documento: ${doc._id} (${doc._type})`);
    await client.createOrReplace(doc);
  }

  console.log('✅ Migración completada con éxito.');
}

migrar().catch(console.error);

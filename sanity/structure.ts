import type { StructureResolver } from 'sanity/structure'
import CertificadoView from './components/CertificadoView'

// Estructura del panel de administración de SKILGLASS
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Panel SKILGLASS')
    .items([
      // ─── VENTAS ─────────────────────────────────────────────────────────
      S.listItem()
        .title('🛒  Pedidos y Ventas')
        .child(
          S.documentTypeList('pedido')
            .title('Pedidos recibidos')
            .defaultOrdering([{ field: 'fecha', direction: 'desc' }])
        ),

      S.divider(),

      // ─── CATÁLOGO ───────────────────────────────────────────────────────
      S.listItem()
        .title('💎  Piezas (Productos)')
        .id('catalogo-piezas')
        .child(
          S.documentTypeList('producto')
            .title('Todas las piezas del catálogo')
        ),

      S.listItem()
        .title('🗂️  Cápsulas')
        .id('menu-capsulas')
        .child(
          S.documentTypeList('coleccion')
            .title('Cápsulas de piezas')
        ),

      S.listItem()
        .title('📜  Certificados Emitidos')
        .id('certificados-emitidos')
        .child(
          S.documentTypeList('producto')
            .title('Registro de Certificados')
            .defaultOrdering([{ field: 'numeroCertificado', direction: 'asc' }])
        ),

      S.divider(),

      // ─── CONFIGURACIÓN DEL SITIO ─────────────────────────────────────────
      S.listItem()
        .title('🖼️ Página de Inicio (Home)')
        .child(
          S.list()
            .title('Secciones del Home')
            .items([
              S.listItem()
                .title('1 · 🖼️  Portada')
                .child(
                  S.document()
                    .schemaType('heroConfig')
                    .documentId('heroConfig')
                    .title('Portada — Título, fotos y subtítulo')
                ),
              S.listItem()
                .title('2 · 🗂️  Cápsulas')
                .child(
                  S.document()
                    .schemaType('capsulasSectionConfig')
                    .documentId('capsulasSectionConfig')
                    .title('Cápsulas — Series Conceptuales')
                ),
              S.listItem()
                .title('3 · 💎  Pieza Destacada')
                .child(
                  S.document()
                    .schemaType('alquimiaSectionConfig')
                    .documentId('alquimiaSectionConfig')
                    .title('Pieza Destacada — La Alquimia')
                ),
              S.listItem()
                .title('4 · 💬  Frase Editorial')
                .child(
                  S.document()
                    .schemaType('fraseSectionConfig')
                    .documentId('fraseSectionConfig')
                    .title('Frase Editorial')
                ),
              S.listItem()
                .title('5 · 📦  Productos Destacados')
                .child(
                  S.document()
                    .schemaType('productosSectionConfig')
                    .documentId('productosSectionConfig')
                    .title('Productos Destacados')
                ),
              S.listItem()
                .title('6 · ⚙️  Proceso de Creación')
                .child(
                  S.document()
                    .schemaType('procesoSectionConfig')
                    .documentId('procesoSectionConfig')
                    .title('Proceso de Creación')
                ),
              S.divider(),
              S.listItem()
                .title('7 · 📸  Diario del Taller')
                .child(
                  S.document()
                    .schemaType('diarioTaller')
                    .documentId('diarioTaller-singleton')
                    .title('Diario del Taller')
                ),
            ])
        ),

      S.listItem()
        .title('💎  Página de Producto')
        .child(
          S.document()
            .schemaType('productoConfig')
            .documentId('productoConfig')
            .title('Diseño de Página de Producto')
        ),

      S.listItem()
        .title('⚙️  Datos de contacto y redes')
        .child(
          S.document()
            .schemaType('settings')
            .documentId('settings')
            .title('WhatsApp, Email e Instagram')
        ),

      S.listItem()
        .title('❓  Ayuda y Preguntas Frecuentes')
        .child(
          S.document()
            .schemaType('soporte')
            .documentId('soporte')
            .title('Página de Soporte')
        ),
    ])

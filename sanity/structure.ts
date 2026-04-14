import type { StructureResolver } from 'sanity/structure'
import CertificadoView from './components/CertificadoView'

// Estructura del panel de administración de SKILGLASS
// Organizada por flujo de trabajo: primero lo que se edita más seguido
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
        .child(
          S.documentTypeList('producto')
            .title('Todas las piezas del catálogo')
        ),

      S.listItem()
        .title('🗂️  Cápsulas')
        .child(
          S.documentTypeList('coleccion')
            .title('Cápsulas de piezas')
        ),

      S.listItem()
        .title('📜  Certificados Emitidos')
        .child(
          S.documentTypeList('producto')
            .title('Registro de Certificados')
            .defaultOrdering([{ field: 'numeroCertificado', direction: 'asc' }])
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('producto')
                .views([
                  S.view
                    .component(CertificadoView)
                    .title('📜 Certificado'),
                ])
            )
        ),

      S.divider(),

      // ─── CONFIGURACIÓN DEL SITIO ─────────────────────────────────────────
      S.listItem()
        .title('🖼️  Página de Inicio (Home)')
        .child(
          S.document()
            .schemaType('homeConfig')
            .documentId('homeConfig')
            .title('Editar la página de inicio')
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

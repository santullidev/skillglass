import type { StructureResolver } from 'sanity/structure'

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
        .title('🗂️  Colecciones')
        .child(
          S.documentTypeList('coleccion')
            .title('Colecciones de piezas')
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

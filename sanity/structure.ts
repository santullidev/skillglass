import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Configuración del Home')
        .child(
          S.document()
            .schemaType('homeConfig')
            .documentId('homeConfig')
        ),
      S.listItem()
        .title('Soporte y Ayuda')
        .child(
          S.document()
            .schemaType('soporte')
            .documentId('soporte')
        ),
      S.listItem()
        .title('Configuración General')
        .child(
          S.document()
            .schemaType('settings')
            .documentId('settings')
        ),
      S.divider(),
      S.documentTypeListItem('coleccion').title('Colecciones'),
      S.documentTypeListItem('producto').title('Productos'),
      S.divider(),
      S.documentTypeListItem('pedido').title('Pedidos (Ventas)'),
    ])

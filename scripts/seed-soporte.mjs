import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
})

const soporteData = {
  _id: 'soporte',
  _type: 'soporte',
  titulo: '¿Cómo podemos ayudarte?',
  subtitulo: 'En SKILGLASS cada pieza es esculpida a mano en el fuego. Detrás de cada joya hay un humano; por lo tanto, nuestro soporte también es personal y directo.',
  secciones: [
    {
      _key: 'sec1',
      _type: 'seccion',
      titulo: 'Envíos y Tiempos de Taller',
      id: 'envios',
      contenido: [
        {
          _key: 'b1',
          _type: 'block',
          children: [
            { _key: 's1', _type: 'span', text: 'Al tratarse de joyería de autor esculpida mediante soplado a la flama, no trabajamos con stock industrial. Si la pieza que adquiriste está en stock, se despacha dentro de las ' },
            { _key: 's2', _type: 'span', text: '48 horas hábiles', marks: ['strong'] },
            { _key: 's3', _type: 'span', text: '.' }
          ],
          style: 'normal'
        },
        {
          _key: 'b2',
          _type: 'block',
          children: [
            { _key: 's1', _type: 'span', text: 'Si se trata de un diseño a pedido o "pre-order", el proceso de fundido, esculpido y templado puede tomar entre ' },
            { _key: 's2', _type: 'span', text: '7 y 14 días', marks: ['strong'] },
            { _key: 's3', _type: 'span', text: '. Creemos en el tiempo que exige el fuego para entregar una pieza eterna. Todos los envíos nacionales se realizan por correo prioritario, e internacionales mediante DHL Express.' }
          ],
          style: 'normal'
        }
      ]
    },
    {
      _key: 'sec2',
      _type: 'seccion',
      titulo: 'Guía de Cuidado',
      id: 'cuidados',
      contenido: [
        {
          _key: 'b1',
          _type: 'block',
          children: [
            { _key: 's1', _type: 'span', text: 'Nuestras piezas están fabricadas con varillas de cristal de alta pureza (borosilicato y sodocálcico) y han pasado por un proceso de templado artesanal (annealing) que garantiza su durabilidad extrema frente al choque térmico. Sin embargo, siguen siendo joyas de cristal.' }
          ],
          style: 'normal'
        },
        {
          _key: 'b2',
          _type: 'block',
          listItem: 'bullet',
          children: [
            { _key: 's1', _type: 'span', text: 'Impactos duros: ', marks: ['strong'] },
            { _key: 's2', _type: 'span', text: 'Evita golpear tus anillos o pendientes contra superficies de piedra, mármol o metal plano.' }
          ],
          style: 'normal'
        },
        {
          _key: 'b3',
          _type: 'block',
          listItem: 'bullet',
          children: [
            { _key: 's1', _type: 'span', text: 'Limpieza: ', marks: ['strong'] },
            { _key: 's2', _type: 'span', text: 'Puedes limpiarlas con un paño de microfibra suave. Si es necesario, usa agua tibia y jabón neutro. Nunca uses limpiadores abrasivos.' }
          ],
          style: 'normal'
        },
        {
          _key: 'b4',
          _type: 'block',
          listItem: 'bullet',
          children: [
            { _key: 's1', _type: 'span', text: 'Almacenamiento: ', marks: ['strong'] },
            { _key: 's2', _type: 'span', text: 'Recomendamos guardarlas en la funda de tela o caja rígida original en la que las recibiste para evitar fricciones.' }
          ],
          style: 'normal'
        }
      ]
    },
    {
      _key: 'sec3',
      _type: 'seccion',
      titulo: 'Garantía y Devoluciones',
      id: 'devoluciones',
      contenido: [
        {
          _key: 'b1',
          _type: 'block',
          children: [
            { _key: 's1', _type: 'span', text: 'Dado que los patrones que se forman dentro de las gotas de cristal fundido son dictados por la tensión de la llama y la gravedad, recuerda que ' },
            { _key: 's2', _type: 'span', text: 'ninguna pieza será absolutamente idéntica a la fotografía', marks: ['strong'] },
            { _key: 's3', _type: 'span', text: '. Eso es precisamente lo que garantiza su autenticidad.' }
          ],
          style: 'normal'
        },
        {
          _key: 'b2',
          _type: 'block',
          children: [
            { _key: 's1', _type: 'span', text: 'Si recibes una pieza que ha sufrido daños durante el transporte, tienes 48 horas para comunicarte con nosotros adjuntando una fotografía del paquete, y organizaremos el reemplazo de inmediato. Para devoluciones por cambios de opinión, aceptamos solicitudes dentro de los primeros 10 días tras recibir la joya.' }
          ],
          style: 'normal'
        }
      ]
    }
  ]
}

async function seedSoporte() {
  console.log('🚀 Iniciando carga de datos de Soporte...')
  try {
    const result = await client.createOrReplace(soporteData)
    console.log('✅ Soporte actualizado con éxito:', result._id)
  } catch (err) {
    console.error('❌ Error al cargar soporte:', err)
  }
}

seedSoporte()

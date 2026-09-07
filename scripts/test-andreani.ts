/**
 * scripts/test-andreani.ts
 *
 * Verifica la integración con Andreani usando el código real de lib/andreani.ts.
 *
 * ─── USO ──────────────────────────────────────────────────────────────────────
 *
 *   npx tsx scripts/test-andreani.ts
 *
 * Por defecto corre SOLO comprobaciones de lectura: login, cotización de
 * tarifas, búsqueda de sucursales y consulta de una etiqueta inexistente.
 * Ninguna de ellas crea nada ni tiene costo.
 *
 * ─── ⚠️  CREAR UN ENVÍO DE VERDAD ─────────────────────────────────────────────
 *
 *   ANDREANI_PERMITIR_ENVIO_REAL=si npx tsx scripts/test-andreani.ts --crear-envio
 *
 * Requiere las DOS cosas (la variable y el flag) a propósito, para que no pase
 * por accidente.
 *
 * Si ANDREANI_ORDENES_BASE_URL apunta a producción, esto genera un envío REAL,
 * facturable, con número de seguimiento. La API v2 de Andreani NO permite
 * cancelar envíos: para dar de baja uno hay que hablar con Andreani.
 *
 * Para probar el alta sin consecuencias, poné en .env.local:
 *   ANDREANI_ORDENES_BASE_URL=https://apisqa.andreani.com
 * con las credenciales de QA.
 */

import dotenv from 'dotenv'
import { createInterface } from 'readline/promises'

dotenv.config({ path: process.env.ENV_FILE || '.env.local' })

const CP_PRUEBA = process.env.CP_PRUEBA || '1414'
const crearEnvio = process.argv.includes('--crear-envio')
const permitido = process.env.ANDREANI_PERMITIR_ENVIO_REAL === 'si'

const ok = (msg: string) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`)
const fail = (msg: string) => console.log(`  \x1b[31m✗\x1b[0m ${msg}`)
const titulo = (msg: string) => console.log(`\n\x1b[1m${msg}\x1b[0m`)

let fallos = 0

async function main() {
  // Import dinámico: lib/andreani lee process.env al cargarse.
  const {
    cotizarEnvio,
    construirBulto,
    buscarSucursalesPorCP,
    crearOrdenEnvio,
    obtenerEtiquetaPdf,
  } = await import('../lib/andreani')

  const hostOrdenes = process.env.ANDREANI_ORDENES_BASE_URL || process.env.ANDREANI_BASE_URL || 'https://apis.andreani.com'
  const esProduccion = !/apisqa|sandbox/.test(hostOrdenes)

  console.log('\n══════════════════════════════════════════════════════════')
  console.log(`  Tarifas y sucursales : ${process.env.ANDREANI_BASE_URL}`)
  console.log(`  Órdenes y etiquetas  : ${hostOrdenes}`)
  console.log(`  Usuario              : ${process.env.ANDREANI_USUARIO || '(sin configurar)'}`)
  console.log(`  Ambiente de órdenes  : ${esProduccion ? '\x1b[31mPRODUCCIÓN\x1b[0m' : 'QA'}`)
  console.log('══════════════════════════════════════════════════════════')

  const bulto = construirBulto([{ peso: 300, cantidad: 1, precio: 55000 }])

  // ─── 1. Cotización (endpoint público, sin credenciales) ───────────────────
  titulo('1. Cotización de tarifas')
  try {
    const cotizaciones = await cotizarEnvio(CP_PRUEBA, bulto)
    if (cotizaciones.length === 0) {
      fail('No devolvió ninguna tarifa. ¿Están bien los contratos?')
      fallos++
    }
    for (const c of cotizaciones) {
      ok(`${c.tipo.padEnd(10)} $${c.tarifa.toLocaleString('es-AR')}  (contrato ${c.contrato}, seguro $${c.seguro})`)
    }
  } catch (e) {
    fail(`Falló: ${(e as Error).message}`)
    fallos++
  }

  // ─── 2. Sucursales (endpoint público) ─────────────────────────────────────
  titulo('2. Sucursales que atienden el CP')
  try {
    const sucursales = await buscarSucursalesPorCP(CP_PRUEBA)
    if (sucursales.length === 0) {
      fail(`Sin sucursales B2C para el CP ${CP_PRUEBA}`)
      fallos++
    }
    for (const s of sucursales) {
      ok(`${s.descripcion} (id ${s.id}) — ${s.calle} ${s.numero}, ${s.localidad}`)
    }
  } catch (e) {
    fail(`Falló: ${(e as Error).message}`)
    fallos++
  }

  // ─── 3. Autenticación (login + endpoint autenticado, sin crear nada) ──────
  titulo('3. Credenciales')
  try {
    // Un número inexistente: si el token es válido responde 404 de dominio,
    // no 401. Es la forma de probar la autenticación sin generar un envío.
    await obtenerEtiquetaPdf('999999999999999')
    ok('Login correcto y token aceptado en endpoints autenticados')
  } catch (e) {
    const msg = (e as Error).message
    if (/401|autenticación/i.test(msg)) {
      fail(`Credenciales rechazadas: ${msg}`)
      fallos++
    } else {
      ok('Login correcto y token aceptado en endpoints autenticados')
    }
  }

  // ─── 4. Alta de orden (DESTRUCTIVO — doble llave) ─────────────────────────
  titulo('4. Alta de orden de envío')

  if (!crearEnvio) {
    console.log('  – Omitido. Para probarlo:')
    console.log('    ANDREANI_PERMITIR_ENVIO_REAL=si npx tsx scripts/test-andreani.ts --crear-envio')
  } else if (!permitido) {
    fail('Falta ANDREANI_PERMITIR_ENVIO_REAL=si. No se creó nada.')
  } else {
    if (esProduccion) {
      console.log('\n  \x1b[41m\x1b[97m  ATENCIÓN: esto va a crear un envío REAL y facturable.  \x1b[0m')
      console.log('  \x1b[31m  La API v2 de Andreani no permite cancelarlo desde el código.\x1b[0m')
      const rl = createInterface({ input: process.stdin, output: process.stdout })
      const respuesta = await rl.question('\n  Escribí "CREAR ENVIO REAL" para continuar: ')
      rl.close()
      if (respuesta.trim() !== 'CREAR ENVIO REAL') {
        console.log('  Cancelado. No se creó nada.')
        return resumen()
      }
    }

    try {
      const orden = await crearOrdenEnvio({
        tipoEnvio: 'domicilio',
        idPedido: `test-${Date.now()}`,
        destinatario: {
          nombreCompleto: process.env.TEST_DESTINATARIO_NOMBRE || 'Prueba Skilglass',
          email: process.env.TEST_DESTINATARIO_EMAIL || 'hola@skilglass.com.ar',
          telefono: process.env.TEST_DESTINATARIO_TELEFONO || '2213581597',
          documentoNumero: process.env.TEST_DESTINATARIO_DNI || '30123456',
        },
        bulto,
        destinoPostal: {
          codigoPostal: CP_PRUEBA,
          calle: process.env.TEST_DESTINO_CALLE || 'Av Corrientes',
          numero: process.env.TEST_DESTINO_NUMERO || '1234',
          localidad: process.env.TEST_DESTINO_LOCALIDAD || 'CABA',
          provincia: process.env.TEST_DESTINO_PROVINCIA || 'Buenos Aires',
        },
      })

      if (orden.numeroDeEnvio) {
        ok(`Envío creado: ${orden.numeroDeEnvio} (estado: ${orden.estado})`)
        const pdf = await obtenerEtiquetaPdf(orden.numeroDeEnvio)
        if (pdf) ok(`Etiqueta disponible (${Math.round(pdf.byteLength / 1024)} KB)`)
        else fail('El envío se creó pero la etiqueta todavía no está disponible')
        if (esProduccion) {
          console.log(`\n  \x1b[33m→ Anotá el número ${orden.numeroDeEnvio} para gestionarlo con Andreani.\x1b[0m`)
        }
      } else {
        fail('Andreani aceptó la orden pero no devolvió número de envío')
        console.log('   respuesta:', JSON.stringify(orden.raw))
        fallos++
      }
    } catch (e) {
      fail(`Falló: ${(e as Error).message}`)
      fallos++
    }
  }

  resumen()
}

function resumen() {
  console.log('\n══════════════════════════════════════════════════════════')
  if (fallos === 0) console.log('  \x1b[32mTodo OK\x1b[0m')
  else console.log(`  \x1b[31m${fallos} comprobación(es) fallaron\x1b[0m`)
  console.log('══════════════════════════════════════════════════════════\n')
  process.exit(fallos === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('\nError inesperado:', e)
  process.exit(1)
})

import { client } from '@/lib/sanity'
import { SETTINGS_QUERY } from '@/lib/queries'
import EnvioClient from './EnvioClient'

// Fallback por si aún no hay settings cargados en Sanity
const FALLBACK_PHONE = '5492235584416'

export default async function EnvioPage() {
  const settings = await client.fetch(SETTINGS_QUERY)
  const phone: string = settings?.telefono ?? FALLBACK_PHONE

  // El costo de envío ya no sale de Sanity: se cotiza contra Andreani en tiempo
  // real desde el checkout, según el CP y el peso del carrito.
  return <EnvioClient whatsappPhone={phone} />
}

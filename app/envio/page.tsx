import { client } from '@/lib/sanity'
import { SETTINGS_QUERY } from '@/lib/queries'
import EnvioClient from './EnvioClient'

// Fallbacks por si aún no hay settings cargados en Sanity
const FALLBACK_PHONE = '5492235584416'
const FALLBACK_TARIFA_LOCAL = 7000
const FALLBACK_TARIFA_INTERIOR = 15000

export default async function EnvioPage() {
  const settings = await client.fetch(SETTINGS_QUERY)

  const phone: string = settings?.telefono ?? FALLBACK_PHONE
  const tarifaLocal: number = settings?.tarifaEnvioLocal ?? FALLBACK_TARIFA_LOCAL
  const tarifaInterior: number = settings?.tarifaEnvioInterior ?? FALLBACK_TARIFA_INTERIOR

  return (
    <EnvioClient
      whatsappPhone={phone}
      tarifaLocal={tarifaLocal}
      tarifaInterior={tarifaInterior}
    />
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LegacyDatosEnvio() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/envio')
  }, [router])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-pulse text-primary font-serif italic text-xs tracking-widest uppercase">
        Optimizando flujo de envío...
      </div>
    </div>
  )
}

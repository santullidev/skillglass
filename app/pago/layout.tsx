import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: 'Pago %s | SKILLGLASS',
    default: 'Pago | SKILLGLASS',
  },
}

export default function PagoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

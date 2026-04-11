import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Favicon: monograma SKG con tipografía serif sobre fondo blanco
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#6B1A2A',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          SKG
        </span>
      </div>
    ),
    {
      ...size,
    }
  )
}

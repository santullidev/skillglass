import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Favicon generation using Next.js 15 Metadata API
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #120A0E 0%, #1A1215 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
          overflow: 'hidden',
          border: '1px solid rgba(169, 199, 255, 0.2)',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            background: 'linear-gradient(135deg, rgba(169, 199, 255, 0.9) 0%, rgba(169, 199, 255, 0.2) 100%)',
            borderRadius: '50% 50% 50% 50% / 10% 10% 90% 90% ',
            transform: 'rotate(45deg)',
            boxShadow: '0 0 10px rgba(169, 199, 255, 0.4)',
            filter: 'blur(0.5px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '35%',
            width: '4px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            filter: 'blur(1px)',
            transform: 'rotate(-25deg)',
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}

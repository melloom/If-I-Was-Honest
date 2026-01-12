import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'If I Was Honest - Anonymous Thoughts You Never Sent'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #2a2a2a 0%, #1a1a1a 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
          }}
        >
          {/* App icon/logo */}
          <img
            src="https://thehonestproject.co/metadata-photo.png"
            width={120}
            height={120}
            style={{
              borderRadius: '24px',
              marginBottom: '32px',
            }}
          />
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: '16px',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            If I Was Honest
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#a0a0a0',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            Anonymous thoughts you never sent.
          </div>
          <div
            style={{
              marginTop: '40px',
              padding: '14px 32px',
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              borderRadius: '100px',
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            thehonestproject.co
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'If I Was Honest - Private Journaling & Mental Wellness'
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
          backgroundColor: '#fafafa',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #e0e0e0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e0e0e0 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '60px 80px',
            borderRadius: '24px',
            border: '2px solid #e0e0e0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: '#1a1a1a',
              marginBottom: '20px',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            If I Was Honest
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#6a6a6a',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            A private-first journaling app for authentic self-reflection
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: '#E5F3FF',
                color: '#1976d2',
                borderRadius: '100px',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              ✓ Still true
            </div>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: '#E5FFE5',
                color: '#2e7d32',
                borderRadius: '100px',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              🌱 I've grown
            </div>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: '#FFF5E5',
                color: '#ed6c02',
                borderRadius: '100px',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              🛡️ I was coping
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

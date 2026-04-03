// app/icon.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const contentType = 'image/png';

export default function Icon({ id }: { id?: string }) {
  const size = id === '512' ? 512 : 192;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #222222, #000000)',
          borderRadius: size * 0.2, // App icon typical border radius is around 20-22%
        }}
      >
        <div
          style={{
            width: '88%',
            height: '88%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #111111, #000000)',
            borderRadius: size * 0.15,
            border: `${size * 0.015}px solid #D4AF37`,
            boxShadow: `inset 0 0 ${size * 0.1}px rgba(212,175,55,0.2)`
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: size * 0.5,
                lineHeight: 1,
                letterSpacing: `-${size * 0.03}px`,
                textShadow: `0px ${size * 0.02}px ${size * 0.05}px rgba(0,0,0,0.8)`
              }}
            >
              <span style={{ color: '#FFFFFF', marginRight: size * 0.01 }}>G</span>
              <span style={{ color: '#D4AF37' }}>B</span>
            </div>
            
            <svg
               width={size * 0.15}
               height={size * 0.15}
               viewBox="0 0 24 24"
               fill="#facc15"
               style={{ 
                   marginLeft: size * 0.01,
                   alignSelf: 'flex-start',
                   marginTop: size * 0.02,
                   filter: `drop-shadow(0px 0px ${size * 0.01}px rgba(250,204,21,0.5))`
               }}
            >
               <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}

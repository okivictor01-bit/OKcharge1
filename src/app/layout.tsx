import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'OKcharge - Powerbank Rental',
  description: 'Rent a powerbank instantly across partner locations.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <a href="https://wa.me/2347032385674" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" style={{ position: 'fixed', bottom: '20px', right: '20px', width: '56px', height: '56px', backgroundColor: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: 9999 }}>
          <svg viewBox="0 0 32 32" width="30" height="30" fill="white">
            <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.908 6.47L4 29l7.72-1.867A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.6c-1.98 0-3.83-.55-5.41-1.5l-.388-.23-4.58 1.108 1.128-4.463-.253-.4A9.55 9.55 0 0 1 5.4 15c0-5.85 4.75-10.6 10.6-10.6S26.6 9.15 26.6 15 21.85 24.6 16 24.6zm5.79-7.93c-.317-.158-1.878-.927-2.169-1.033-.29-.106-.502-.158-.713.158-.211.317-.818 1.033-1.004 1.245-.185.211-.37.238-.687.08-.317-.159-1.338-.493-2.548-1.571-.942-.84-1.578-1.879-1.763-2.196-.185-.317-.02-.489.139-.647.143-.142.317-.37.475-.554.159-.185.211-.317.317-.529.106-.211.053-.396-.026-.554-.08-.159-.713-1.719-.977-2.354-.257-.617-.518-.534-.713-.544-.184-.009-.396-.011-.607-.011-.211 0-.554.079-.844.396-.29.317-1.106 1.081-1.106 2.636 0 1.556 1.132 3.058 1.29 3.269.159.211 2.229 3.404 5.401 4.773.755.326 1.344.52 1.803.665.758.241 1.448.207 1.993.126.608-.091 1.878-.767 2.143-1.508.264-.741.264-1.376.185-1.508-.079-.132-.29-.211-.607-.37z"/>
          </svg>
        </a>
      </body>
    </html>
  )
}

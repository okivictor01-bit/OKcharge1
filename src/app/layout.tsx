import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OKcharge - Powerbank Rental',
  description: 'Rent a powerbank instantly across partner locations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

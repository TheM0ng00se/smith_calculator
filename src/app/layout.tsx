import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smith Manoeuvre Calculator',
  description: 'Calculate your Smith Manoeuvre strategy and potential tax savings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
                    <html lang="en">
                  <body className="bg-dark-950 min-h-screen">
                    {children}
                  </body>
                </html>
  )
} 
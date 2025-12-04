import type { Metadata, Viewport } from 'next'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhotoShare - Media Distribution Platform',
  description: 'Share and discover amazing photos from creators worldwide',
  generator: 'v0.app'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
              <p>&copy; 2025 PhotoShare. A cloud-native media distribution platform.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhotoShare - Media Distribution Platform',
  description: 'Share and discover amazing photos from creators worldwide',
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50" suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
            <p>&copy; 2025 PhotoShare. A cloud-native media distribution platform.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

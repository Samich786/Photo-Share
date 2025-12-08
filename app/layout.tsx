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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 mt-auto transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>&copy; 2025 <span className="font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">MediaShare</span>. A cloud-native media platform.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}

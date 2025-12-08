import { PhotoFeed } from '@/components/photo-feed'
import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-violet-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Discover</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Amazing photos and videos from creators</p>
          </div>
        </div>
        
        <PhotoFeed />
      </div>

      {/* Motivational Section */}
      <section className="mt-20 sm:mt-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-fuchsia-900 to-violet-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4LTguMDYtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-fuchsia-400"></div>
              <span className="text-fuchsia-400 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase">Keep Creating</span>
              <div className="h-[2px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-fuchsia-400"></div>
            </div>

            {/* Main motivational text */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              <span className="block">Step by Step —</span>
              <span className="block mt-2 bg-gradient-to-r from-violet-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Success is Closer
              </span>
              <span className="block mt-2">Than You Think.</span>
            </h2>

            {/* Decorative elements */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"></div>
      </section>
    </main>
  )
}

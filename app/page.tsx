import { PhotoFeed } from '@/components/photo-feed'

export default function Home() {
  return (
    <main className="py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Photo Feed</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 md:mb-8">Discover amazing photos and videos from creators</p>
        <PhotoFeed />
      </div>

      {/* Motivational Section */}
      <section className="mt-16 sm:mt-20 md:mt-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4LTguMDYtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-yellow-400"></div>
              <span className="text-yellow-400 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase">Keep Going</span>
              <div className="h-[2px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-yellow-400"></div>
            </div>

            {/* Main motivational text */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              <span className="block">Step by Step —</span>
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">
                Success is Closer
              </span>
              <span className="block mt-2">Than You Think.</span>
            </h2>

            {/* Decorative elements */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"></div>
      </section>
    </main>
  )
}

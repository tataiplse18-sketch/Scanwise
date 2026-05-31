export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <div className="h-9 w-9 rounded-xl bg-dark-700 animate-pulse" />
        <div className="h-4 w-24 rounded bg-dark-700 animate-pulse" />
        <div className="w-9" />
      </header>

      {/* Filter Tabs Skeleton */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-16 rounded-full bg-dark-700 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Scan Cards Skeleton */}
      <main className="px-4 py-4 pb-28">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-full bg-dark-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-dark-700 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-dark-700 animate-pulse" />
              </div>
              <div className="h-4 w-4 rounded bg-dark-700 animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-800 bg-dark-900/90 backdrop-blur-xl pb-safe">
        <div className="flex items-center justify-around py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-4 py-1">
              <div className="h-5 w-5 rounded bg-dark-700 animate-pulse" />
              <div className="h-2.5 w-8 rounded bg-dark-700 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

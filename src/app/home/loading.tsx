export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top Bar Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 px-4 py-3">
        <div className="h-5 w-20 rounded-lg bg-dark-700 animate-pulse" />
        <div className="h-9 w-9 rounded-full bg-dark-700 animate-pulse" />
      </header>

      {/* Content */}
      <main className="px-4 pt-20 pb-28 flex-1">
        {/* Welcome Skeleton */}
        <div className="mb-6">
          <div className="h-7 w-40 rounded-lg bg-dark-700 animate-pulse mb-2" />
          <div className="h-4 w-56 rounded-lg bg-dark-700 animate-pulse mb-3" />
          <div className="h-7 w-32 rounded-full bg-dark-700 animate-pulse" />
        </div>

        {/* Scan Button Skeleton */}
        <div className="flex flex-col items-center py-6 mb-6">
          <div className="h-32 w-32 rounded-full bg-dark-700 animate-pulse" />
          <div className="mt-3 h-4 w-20 rounded-lg bg-dark-700 animate-pulse" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card flex flex-col items-center gap-2 p-4">
              <div className="h-10 w-10 rounded-xl bg-dark-700 animate-pulse" />
              <div className="h-3 w-12 rounded bg-dark-700 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Recent Scans Skeleton */}
        <div>
          <div className="h-5 w-28 rounded-lg bg-dark-700 animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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

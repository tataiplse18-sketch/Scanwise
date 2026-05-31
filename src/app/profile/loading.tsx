export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <div className="h-9 w-9 rounded-xl bg-dark-700 animate-pulse" />
        <div className="h-4 w-16 rounded bg-dark-700 animate-pulse" />
        <div className="w-9" />
      </header>

      <main className="px-4 py-6 pb-28 space-y-6">
        {/* User Info Card Skeleton */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-dark-700 animate-pulse mb-4" />
          <div className="h-5 w-28 rounded bg-dark-700 animate-pulse mb-2" />
          <div className="h-4 w-40 rounded bg-dark-700 animate-pulse mb-3" />
          <div className="h-8 w-28 rounded-xl bg-dark-700 animate-pulse" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card flex flex-col items-center p-4">
              <div className="h-5 w-5 rounded bg-dark-700 animate-pulse mb-2" />
              <div className="h-6 w-8 rounded bg-dark-700 animate-pulse mb-1" />
              <div className="h-2.5 w-12 rounded bg-dark-700 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Settings Skeleton */}
        <div>
          <div className="h-3 w-16 rounded bg-dark-700 animate-pulse mb-3 px-1" />
          <div className="glass-card divide-y divide-dark-700">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-dark-700 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-dark-700 animate-pulse" />
                    <div className="h-2.5 w-16 rounded bg-dark-700 animate-pulse" />
                  </div>
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

export default function ResultLoading() {
  return (
    <div className="min-h-screen bg-dark-900 animate-pulse">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
        <div className="h-9 w-9 rounded-xl bg-dark-700" />
        <div className="h-4 w-24 rounded bg-dark-700" />
        <div className="h-9 w-9 rounded-xl bg-dark-700" />
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Product Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-dark-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded bg-dark-700" />
            <div className="h-4 w-1/2 rounded bg-dark-700" />
            <div className="h-3 w-24 rounded bg-dark-700" />
          </div>
        </div>

        {/* Health Score Circle Skeleton */}
        <div className="flex flex-col items-center py-4">
          <div className="h-36 w-36 rounded-full bg-dark-700" />
          <div className="mt-3 h-5 w-20 rounded bg-dark-700" />
          <div className="mt-2 h-3 w-40 rounded bg-dark-700" />
        </div>

        {/* AI Verdict Skeleton */}
        <div className="glass-card p-5 space-y-2">
          <div className="h-4 w-24 rounded bg-dark-700" />
          <div className="h-3 w-full rounded bg-dark-700" />
          <div className="h-3 w-4/5 rounded bg-dark-700" />
          <div className="h-3 w-3/5 rounded bg-dark-700" />
        </div>

        {/* Ingredients Skeleton */}
        <div className="glass-card p-5 space-y-3">
          <div className="h-4 w-36 rounded bg-dark-700" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-dark-700/50 p-3 space-y-1">
                <div className="h-3 w-24 rounded bg-dark-700" />
                <div className="h-2.5 w-full rounded bg-dark-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Skeleton */}
        <div className="glass-card p-5 space-y-3">
          <div className="h-4 w-32 rounded bg-dark-700" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-dark-800">
                <div className="h-3 w-20 rounded bg-dark-700" />
                <div className="h-3 w-12 rounded bg-dark-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

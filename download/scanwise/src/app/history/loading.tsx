export default function HistoryLoading() {
  return (
    <main className="min-h-screen bg-dark-900 p-4 animate-pulse">
      <div className="mb-4">
        <div className="h-7 w-32 rounded bg-dark-700 mb-2" />
        <div className="h-4 w-24 rounded bg-dark-700" />
      </div>
      <div className="h-12 rounded-xl bg-dark-700 mb-4" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-dark-700" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card p-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-dark-700" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-dark-700 mb-2" />
                <div className="h-3 w-20 rounded bg-dark-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

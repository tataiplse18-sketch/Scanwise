export default function ResultLoading() {
  return (
    <main className="min-h-screen bg-dark-900 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-dark-700" />
        <div className="flex-1">
          <div className="h-5 w-40 rounded bg-dark-700 mb-2" />
          <div className="h-3 w-24 rounded bg-dark-700" />
        </div>
      </div>
      <div className="mx-auto mb-6 h-44 w-44 rounded-full bg-dark-700" />
      <div className="glass-card p-4 mb-4">
        <div className="h-5 w-24 rounded bg-dark-700 mb-3" />
        <div className="h-3 w-full rounded bg-dark-700 mb-2" />
        <div className="h-3 w-3/4 rounded bg-dark-700" />
      </div>
      <div className="glass-card p-4">
        <div className="h-5 w-28 rounded bg-dark-700 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 rounded bg-dark-700" />
              <div className="h-3 w-12 rounded bg-dark-700" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

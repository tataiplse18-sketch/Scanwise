export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-dark-900 p-4 animate-pulse">
      <div className="mb-4">
        <div className="h-5 w-24 rounded bg-dark-700 mb-2" />
        <div className="h-7 w-32 rounded bg-dark-700" />
      </div>
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-dark-700" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded bg-dark-700 mb-2" />
            <div className="h-2 w-full rounded bg-dark-700" />
          </div>
        </div>
      </div>
      <div className="h-14 rounded-2xl bg-dark-700 mb-6" />
      <div className="glass-card p-4 mb-4">
        <div className="h-4 w-28 rounded bg-dark-700 mb-4" />
        <div className="flex items-end justify-between gap-2 h-28">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 rounded-t bg-dark-700 h-full" />
          ))}
        </div>
      </div>
    </main>
  );
}

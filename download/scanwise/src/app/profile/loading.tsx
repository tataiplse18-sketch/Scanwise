export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-dark-900 p-4 animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-20 rounded bg-dark-700" />
      </div>
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-dark-700" />
          <div className="flex-1">
            <div className="h-5 w-28 rounded bg-dark-700 mb-2" />
            <div className="h-3 w-32 rounded bg-dark-700" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-dark-700" />
              <div className="h-4 w-32 rounded bg-dark-700" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

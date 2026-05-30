export default function ScanLoading() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500" />
        <p className="text-sm text-dark-400">Loading Scanner...</p>
      </div>
    </main>
  );
}

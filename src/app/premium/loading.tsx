export default function PremiumLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <div className="h-9 w-9 rounded-xl bg-dark-700 animate-pulse" />
        <div className="h-4 w-16 rounded bg-dark-700 animate-pulse" />
        <div className="w-9" />
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-accent-400/20 to-amber-500/20 animate-pulse" />
            <svg
              className="absolute inset-0 h-20 w-20 animate-spin"
              style={{ animationDuration: "2s" }}
              viewBox="0 0 80 80"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="url(#premiumGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="80 150"
              />
              <defs>
                <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}

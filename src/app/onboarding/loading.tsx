export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-400/20 to-blue-500/20 animate-pulse" />
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
              stroke="url(#onboardGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="80 150"
            />
            <defs>
              <linearGradient id="onboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="text-dark-400 text-sm">Setting up your profile...</p>
      </div>
    </div>
  );
}

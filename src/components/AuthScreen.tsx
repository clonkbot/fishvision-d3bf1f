import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Failed to continue as guest.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] relative overflow-hidden flex flex-col">
      {/* Animated water background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0a1628]"></div>
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <pattern id="wave1" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q50 80, 100 100 T200 100" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="2">
                <animate attributeName="d" dur="4s" repeatCount="indefinite"
                  values="M0 100 Q50 80, 100 100 T200 100;M0 100 Q50 120, 100 100 T200 100;M0 100 Q50 80, 100 100 T200 100"/>
              </path>
            </pattern>
            <pattern id="wave2" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <path d="M0 75 Q37.5 55, 75 75 T150 75" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1.5">
                <animate attributeName="d" dur="3s" repeatCount="indefinite"
                  values="M0 75 Q37.5 55, 75 75 T150 75;M0 75 Q37.5 95, 75 75 T150 75;M0 75 Q37.5 55, 75 75 T150 75"/>
              </path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave1)"/>
          <rect width="100%" height="100%" fill="url(#wave2)"/>
        </svg>
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 mb-4 relative">
              <span className="text-4xl md:text-5xl">🎣</span>
              <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/10"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 font-display tracking-tight">
              FISH<span className="text-cyan-400">VISION</span>
            </h1>
            <p className="text-cyan-300/50 mt-2 font-mono text-xs md:text-sm tracking-widest">
              AI-POWERED FISHING INTELLIGENCE
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-[#0d2847]/80 backdrop-blur-xl rounded-2xl border border-cyan-400/20 p-6 md:p-8 shadow-2xl shadow-cyan-900/20">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 text-center">
              {flow === "signIn" ? "Welcome Back" : "Create Account"}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cyan-300/70 text-sm mb-2 font-mono">EMAIL</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-[#0a1628]/80 border border-cyan-400/20 rounded-xl text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="angler@fishvision.ai"
                />
              </div>
              <div>
                <label className="block text-cyan-300/70 text-sm mb-2 font-mono">PASSWORD</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-[#0a1628]/80 border border-cyan-400/20 rounded-xl text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <input name="flow" type="hidden" value={flow} />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  flow === "signIn" ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-cyan-400/20"></div>
              <span className="text-cyan-300/40 text-xs font-mono">OR</span>
              <div className="flex-1 h-px bg-cyan-400/20"></div>
            </div>

            <button
              onClick={handleAnonymous}
              disabled={isLoading}
              className="w-full mt-6 py-3 md:py-4 bg-transparent border border-cyan-400/30 text-cyan-300 font-semibold rounded-xl hover:bg-cyan-400/10 transition-all disabled:opacity-50"
            >
              Continue as Guest
            </button>

            <p className="mt-6 text-center text-cyan-300/50 text-sm">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-cyan-300/30 text-xs font-mono">
          Requested by{" "}
          <a href="https://twitter.com/TheWorldNews" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300/50 transition-colors">
            @TheWorldNews
          </a>
          {" · "}
          Built by{" "}
          <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300/50 transition-colors">
            @clonkbot
          </a>
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

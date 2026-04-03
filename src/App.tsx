import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { FishFinder } from "./components/FishFinder";
import { AuthScreen } from "./components/AuthScreen";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 animate-pulse"></div>
          </div>
          <p className="text-cyan-300/60 font-mono text-sm tracking-widest">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <FishFinder />;
}

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface FishSpot {
  x: number;
  y: number;
  confidence: string;
  species: string;
  reasoning: string;
}

interface AnalysisResultProps {
  result: {
    _id: Id<"analyses">;
    analysis: string;
    fishSpots: FishSpot[];
    waterType: string;
    overallScore: number;
  };
  imageUrl: string;
  onNewScan: () => void;
}

export function AnalysisResult({ result, imageUrl, onNewScan }: AnalysisResultProps) {
  const [selectedSpot, setSelectedSpot] = useState<FishSpot | null>(null);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high": return "bg-green-500 border-green-400";
      case "medium": return "bg-yellow-500 border-yellow-400";
      default: return "bg-orange-500 border-orange-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-orange-400";
  };

  const waterTypeEmoji: Record<string, string> = {
    lake: "🏞️",
    river: "🏞️",
    ocean: "🌊",
    pond: "💧",
    stream: "🌊",
    unknown: "❓",
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white font-display">Analysis Complete</h2>
          <p className="text-cyan-300/60 text-sm mt-1">
            Found {result.fishSpots.length} potential spot{result.fishSpots.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onNewScan}
          className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Scan
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="p-3 md:p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
          <p className="text-cyan-300/50 text-xs font-mono mb-1">WATER TYPE</p>
          <p className="text-white text-lg md:text-xl font-semibold flex items-center gap-2">
            <span>{waterTypeEmoji[result.waterType] || "🌊"}</span>
            <span className="capitalize text-sm md:text-base">{result.waterType}</span>
          </p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
          <p className="text-cyan-300/50 text-xs font-mono mb-1">FISH SCORE</p>
          <p className={`text-2xl md:text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
            {result.overallScore}<span className="text-base md:text-lg">/10</span>
          </p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
          <p className="text-cyan-300/50 text-xs font-mono mb-1">HOT SPOTS</p>
          <p className="text-2xl md:text-3xl font-bold text-cyan-400">
            {result.fishSpots.length}
          </p>
        </div>
      </div>

      {/* Image with markers */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-400/30 mb-6 group">
        <img src={imageUrl} alt="Analyzed water" className="w-full h-auto" />

        {/* Scan overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 via-transparent to-cyan-400/5 pointer-events-none"></div>

        {/* Fish spot markers */}
        {result.fishSpots.map((spot, index) => (
          <button
            key={index}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full ${getConfidenceColor(spot.confidence)} border-2 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all hover:scale-125 z-10`}
            style={{
              left: `${spot.x * 100}%`,
              top: `${spot.y * 100}%`,
              animation: `pulse 2s infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
            onClick={() => setSelectedSpot(selectedSpot === spot ? null : spot)}
          >
            {index + 1}
          </button>
        ))}

        {/* Sonar rings on markers */}
        {result.fishSpots.map((spot, index) => (
          <div
            key={`ring-${index}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full border border-cyan-400/50 pointer-events-none"
            style={{
              left: `${spot.x * 100}%`,
              top: `${spot.y * 100}%`,
              animation: `sonarPing 3s infinite`,
              animationDelay: `${index * 0.5}s`,
            }}
          />
        ))}

        {/* Selected spot tooltip */}
        {selectedSpot && (
          <div
            className="absolute z-20 bg-[#0a1628]/95 backdrop-blur-xl rounded-xl border border-cyan-400/30 p-4 max-w-xs shadow-2xl"
            style={{
              left: `${Math.min(Math.max(selectedSpot.x * 100, 20), 80)}%`,
              top: `${Math.min(selectedSpot.y * 100 + 10, 70)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐟</span>
              <span className="text-white font-semibold">{selectedSpot.species}</span>
            </div>
            <p className="text-cyan-300/70 text-sm">{selectedSpot.reasoning}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                selectedSpot.confidence === "high" ? "bg-green-500/20 text-green-400" :
                selectedSpot.confidence === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-orange-500/20 text-orange-400"
              }`}>
                {selectedSpot.confidence} confidence
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div className="p-4 md:p-6 rounded-xl bg-cyan-400/5 border border-cyan-400/20 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <h3 className="text-white font-semibold">AI Analysis</h3>
        </div>
        <p className="text-cyan-100/80 leading-relaxed text-sm md:text-base">{result.analysis}</p>
      </div>

      {/* Spot list */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🎯</span> Fishing Spots
        </h3>
        {result.fishSpots.map((spot, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedSpot === spot
                ? "bg-cyan-400/15 border-cyan-400/50"
                : "bg-cyan-400/5 border-cyan-400/10 hover:bg-cyan-400/10"
            }`}
            onClick={() => setSelectedSpot(selectedSpot === spot ? null : spot)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${getConfidenceColor(spot.confidence)} border-2 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium">{spot.species}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    spot.confidence === "high" ? "bg-green-500/20 text-green-400" :
                    spot.confidence === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-orange-500/20 text-orange-400"
                  }`}>
                    {spot.confidence}
                  </span>
                </div>
                <p className="text-cyan-300/60 text-sm mt-1">{spot.reasoning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
        }
        @keyframes sonarPing {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        .font-display {
          font-family: 'Orbitron', sans-serif;
        }
      `}</style>
    </div>
  );
}

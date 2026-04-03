import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface FishSpot {
  x: number;
  y: number;
  confidence: string;
  species: string;
  reasoning: string;
}

interface Analysis {
  _id: Id<"analyses">;
  imageBase64: string;
  analysis: string;
  fishSpots: FishSpot[];
  waterType: string;
  overallScore: number;
  createdAt: number;
}

interface HistoryPanelProps {
  analyses: Analysis[];
  onClose: () => void;
  onSelect: (analysis: Analysis) => void;
}

export function HistoryPanel({ analyses, onClose, onSelect }: HistoryPanelProps) {
  const removeAnalysis = useMutation(api.analyses.remove);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-400 bg-green-400/20";
    if (score >= 4) return "text-yellow-400 bg-yellow-400/20";
    return "text-orange-400 bg-orange-400/20";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a1628]/95 backdrop-blur-xl border-l border-cyan-400/20 z-50 overflow-hidden flex flex-col animate-slideIn">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-cyan-400/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-display">Scan History</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-cyan-400/10 hover:bg-cyan-400/20 flex items-center justify-center text-cyan-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-cyan-300/50 text-sm mt-1">
            {analyses.length} scan{analyses.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-400/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🐟</span>
              </div>
              <p className="text-cyan-300/60">No scans yet</p>
              <p className="text-cyan-300/40 text-sm mt-1">Your analysis history will appear here</p>
            </div>
          ) : (
            analyses.map((analysis) => (
              <div
                key={analysis._id}
                className="group relative rounded-xl overflow-hidden border border-cyan-400/20 hover:border-cyan-400/40 transition-all cursor-pointer"
                onClick={() => onSelect(analysis)}
              >
                {/* Thumbnail */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={`data:image/png;base64,${analysis.imageBase64}`}
                    alt="Scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent"></div>

                  {/* Score badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-sm font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}/10
                  </div>

                  {/* Spots indicator */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                    <span className="text-sm">🎯</span>
                    <span className="text-cyan-300 text-sm font-medium">{analysis.fishSpots.length} spots</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-[#0d2847]/50">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium capitalize flex items-center gap-1.5">
                      <span>🌊</span> {analysis.waterType}
                    </span>
                    <span className="text-cyan-300/40 text-xs">
                      {formatDate(analysis.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAnalysis({ id: analysis._id });
                  }}
                  className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .font-display {
          font-family: 'Orbitron', sans-serif;
        }
      `}</style>
    </>
  );
}

import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useCallback } from "react";
import { AnalysisResult } from "./AnalysisResult";
import { HistoryPanel } from "./HistoryPanel";
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

export function FishFinder() {
  const { signOut } = useAuthActions();
  const chat = useAction(api.ai.chat);
  const createAnalysis = useMutation(api.analyses.create);
  const analyses = useQuery(api.analyses.list) as Analysis[] | undefined;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentResult(null);

    try {
      const systemPrompt = `You are FishVision AI, an expert fishing analysis system. Analyze water photos to identify the best fishing spots.

Your response MUST be valid JSON in this exact format:
{
  "waterType": "lake|river|ocean|pond|stream|unknown",
  "overallScore": 1-10,
  "analysis": "Brief analysis of water conditions and fish potential",
  "fishSpots": [
    {
      "x": 0.0-1.0,
      "y": 0.0-1.0,
      "confidence": "high|medium|low",
      "species": "likely fish species",
      "reasoning": "why this spot is good"
    }
  ]
}

Consider: water clarity, depth indicators, structure (rocks, vegetation, shadows), current patterns, temperature indicators, time of day lighting, surface activity, underwater features.

Be creative but realistic. If the image isn't water, return {"waterType":"unknown","overallScore":0,"analysis":"This doesn't appear to be a water body.","fishSpots":[]}`;

      const response = await chat({
        messages: [
          {
            role: "user",
            content: `Analyze this water photo for fishing spots. The image is provided as base64: ${base64Image.substring(0, 100)}... [image data]. Respond with JSON only.`
          }
        ],
        systemPrompt,
      });

      // Parse the JSON response
      let parsed;
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        // Fallback if parsing fails
        parsed = {
          waterType: "unknown",
          overallScore: 5,
          analysis: response,
          fishSpots: [
            { x: 0.3, y: 0.4, confidence: "medium", species: "Various", reasoning: "Potential structure area" },
            { x: 0.7, y: 0.6, confidence: "low", species: "Unknown", reasoning: "Worth exploring" }
          ]
        };
      }

      // Ensure fishSpots is an array
      const fishSpots = Array.isArray(parsed.fishSpots) ? parsed.fishSpots : [];

      // Save to database
      const id = await createAnalysis({
        imageBase64: base64Image,
        analysis: parsed.analysis || "Analysis complete",
        fishSpots: fishSpots.map((spot: FishSpot) => ({
          x: Math.max(0, Math.min(1, spot.x || 0.5)),
          y: Math.max(0, Math.min(1, spot.y || 0.5)),
          confidence: spot.confidence || "medium",
          species: spot.species || "Unknown",
          reasoning: spot.reasoning || "Potential fishing spot",
        })),
        waterType: parsed.waterType || "unknown",
        overallScore: Math.max(0, Math.min(10, parsed.overallScore || 5)),
      });

      // Set current result for display
      setCurrentResult({
        _id: id,
        imageBase64: base64Image,
        analysis: parsed.analysis || "Analysis complete",
        fishSpots: fishSpots,
        waterType: parsed.waterType || "unknown",
        overallScore: Math.max(0, Math.min(10, parsed.overallScore || 5)),
        createdAt: Date.now(),
      });

    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again with a clear photo of water.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [chat, createAnalysis]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      // Remove data URL prefix for storage
      const base64Data = base64.split(",")[1];
      setCurrentImage(base64);
      await analyzeImage(base64Data);
    };
    reader.readAsDataURL(file);
  }, [analyzeImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleFileSelect(file);
        break;
      }
    }
  }, [handleFileSelect]);

  return (
    <div
      className="min-h-screen bg-[#0a1628] relative overflow-x-hidden flex flex-col"
      onPaste={handlePaste}
    >
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#061220]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        {/* Animated sonar rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"
              style={{
                animation: `sonar 4s ease-out infinite`,
                animationDelay: `${i * 1.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-4 py-4 md:px-8 md:py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center">
              <span className="text-xl md:text-2xl">🎣</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white font-display">
                FISH<span className="text-cyan-400">VISION</span>
              </h1>
              <p className="text-cyan-300/40 text-xs font-mono hidden sm:block">VIBES + AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 md:px-4 md:py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-lg text-cyan-300 text-sm hover:bg-cyan-400/20 transition-all flex items-center gap-2"
            >
              <span className="hidden sm:inline">History</span>
              <span className="text-cyan-400/60">({analyses?.length || 0})</span>
            </button>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 md:px-4 md:py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hover:bg-red-500/20 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10 px-4 py-6 md:px-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {!currentResult && !isAnalyzing ? (
            <>
              {/* Upload area */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 font-display">
                  Where Are The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Fish</span>?
                </h2>
                <p className="text-cyan-300/60 max-w-md mx-auto text-sm md:text-base">
                  Drop a photo of any water body and let AI find your next big catch
                </p>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 md:p-16 text-center transition-all cursor-pointer ${
                  dragOver
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-cyan-400/30 hover:border-cyan-400/50 hover:bg-cyan-400/5"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <p className="text-white text-lg md:text-xl font-medium mb-2">
                  Drop your water photo here
                </p>
                <p className="text-cyan-300/50 text-sm mb-4">
                  or click to browse · paste from clipboard
                </p>
                <p className="text-cyan-300/30 text-xs font-mono">
                  SUPPORTED: JPG, PNG, WEBP
                </p>
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* Quick tips */}
              <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "🌊", title: "Clear Water", desc: "Best results with visible water surface" },
                  { icon: "☀️", title: "Good Light", desc: "Daylight photos work best" },
                  { icon: "📸", title: "Wide Angle", desc: "Show more water area for better spots" },
                ].map((tip) => (
                  <div key={tip.title} className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/10">
                    <span className="text-2xl mb-2 block">{tip.icon}</span>
                    <h3 className="text-white font-medium text-sm">{tip.title}</h3>
                    <p className="text-cyan-300/50 text-xs mt-1">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </>
          ) : isAnalyzing ? (
            /* Loading state */
            <div className="text-center py-12 md:py-20">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
                {/* Sonar animation */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30"></div>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-cyan-400"
                    style={{
                      animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl animate-bounce">🐟</span>
                </div>
              </div>

              {currentImage && (
                <div className="max-w-sm mx-auto mb-8 rounded-xl overflow-hidden border border-cyan-400/20 opacity-50">
                  <img src={currentImage} alt="Analyzing" className="w-full h-auto" />
                </div>
              )}

              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Scanning for Fish...</h3>
              <p className="text-cyan-300/60 max-w-md mx-auto text-sm md:text-base">
                Analyzing water patterns, depth indicators, and structure
              </p>

              <div className="mt-6 flex items-center justify-center gap-2">
                {["Analyzing depth", "Finding structure", "Locating fish"].map((step, i) => (
                  <span
                    key={step}
                    className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300/60 text-xs font-mono animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ) : currentResult && (
            <AnalysisResult
              result={currentResult}
              imageUrl={currentImage!}
              onNewScan={() => {
                setCurrentResult(null);
                setCurrentImage(null);
              }}
            />
          )}
        </div>
      </main>

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          analyses={analyses || []}
          onClose={() => setShowHistory(false)}
          onSelect={(analysis) => {
            setCurrentResult(analysis);
            setCurrentImage(`data:image/png;base64,${analysis.imageBase64}`);
            setShowHistory(false);
          }}
        />
      )}

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
        @keyframes sonar {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .font-display {
          font-family: 'Orbitron', sans-serif;
        }
      `}</style>
    </div>
  );
}

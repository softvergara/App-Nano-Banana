import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { Wand2, Loader2, Download, RefreshCw, Layers } from 'lucide-react';

interface GeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

const PRESET_PROMPT = "Genérame 5 ilustraciones de la segunda guerra mundial de las batallas en Africa con el Afrika Kors, los ingleses, etc";

const Generator: React.FC<GeneratorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState(PRESET_PROMPT);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setProgress({ current: 0, total: count });

    try {
      // Loop to generate multiple images if requested
      // We do this sequentially to allow progress updates, though Promise.all is faster.
      // Sequential is safer for rate limits and better UX feedback for "generating 1 of 5..."
      for (let i = 0; i < count; i++) {
        setProgress(prev => ({ ...prev, current: i + 1 }));
        
        const base64Image = await generateImage({
          prompt,
          aspectRatio,
          count: 1 // API call is always single for this model usually
        });

        const newImage: GeneratedImage = {
          id: crypto.randomUUID(),
          url: base64Image,
          prompt: prompt,
          createdAt: Date.now()
        };

        onImageGenerated(newImage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-400" />
          Create New Images
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Prompt
            </label>
            <textarea
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Aspect Ratio
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="3:4">Vertical (3:4)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-xl p-2 px-4">
                <Layers className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-white font-mono w-4">{count}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
              isGenerating
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Image {progress.current} of {progress.total}...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
         <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded text-xs border border-yellow-500/20">TIP</span>
            Try prompts like "A futuristic city in neon style" or "Oil painting of a cat".
         </p>
      </div>
    </div>
  );
};

export default Generator;
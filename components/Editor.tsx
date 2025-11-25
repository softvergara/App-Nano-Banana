import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { ImagePlus, Loader2, Sparkles, X, Upload } from 'lucide-react';

interface EditorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

const Editor: React.FC<EditorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // result is like data:image/png;base64,....
      // We need to extract the base64 part for the API call later, but keep full string for preview
      setSourceImage(result);
      setSourceMimeType(file.type);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setSourceMimeType(file.type);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSourceImage(null);
    setSourceMimeType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !sourceImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Extract pure base64
      const base64Data = sourceImage.split(',')[1];

      const resultBase64 = await editImage({
        prompt,
        sourceImageBase64: base64Data,
        sourceImageMimeType: sourceMimeType
      });

      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: resultBase64,
        prompt: `Edit: ${prompt}`,
        createdAt: Date.now()
      };

      onImageGenerated(newImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during editing");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Edit Existing Image
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Image Uploader */}
          <div 
            className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
              sourceImage ? 'border-purple-500/50 bg-slate-900' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-purple-400'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {sourceImage ? (
              <div className="relative w-full h-full p-2 group">
                <img 
                  src={sourceImage} 
                  alt="Source" 
                  className="w-full h-full object-contain rounded-lg"
                />
                <button 
                  onClick={clearImage}
                  className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="text-center p-6 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">Click to upload or drag & drop</p>
                <p className="text-slate-500 text-sm mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Instructions
                </label>
                <textarea
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="E.g., 'Add a retro filter', 'Remove the background', 'Make it look like a sketch'..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
                 <p className="text-purple-200 text-sm">
                   Describe how you want to change the image. The model will regenerate the image based on your visual input and text instructions.
                 </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleEdit}
              disabled={isGenerating || !prompt.trim() || !sourceImage}
              className={`mt-4 w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                isGenerating || !prompt.trim() || !sourceImage
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/25 active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Edit...
                </>
              ) : (
                <>
                  <ImagePlus className="w-5 h-5" />
                  Edit Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;

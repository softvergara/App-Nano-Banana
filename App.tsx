import React, { useState } from 'react';
import { AppMode, GeneratedImage } from './types';
import Generator from './components/Generator';
import Editor from './components/Editor';
import { Download, ExternalLink, Image as ImageIcon, Sparkles, Trash2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);

  const addToGallery = (image: GeneratedImage) => {
    setGallery(prev => [image, ...prev]);
  };

  const deleteFromGallery = (id: string) => {
    setGallery(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NanoArt Studio
            </span>
            <span className="hidden sm:block text-xs font-mono text-slate-500 border border-slate-800 rounded px-1.5 py-0.5 ml-2">v2.5-flash-image</span>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMode(AppMode.GENERATE)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                mode === AppMode.GENERATE 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => setMode(AppMode.EDIT)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                mode === AppMode.EDIT 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Edit
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col gap-12">
        
        {/* Active Tool Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              {mode === AppMode.GENERATE ? 'Visualize your imagination' : 'Reimagine your photos'}
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {mode === AppMode.GENERATE 
                ? 'Generate stunning high-quality images from text descriptions using the power of Gemini 2.5 Flash.' 
                : 'Upload an image and use natural language to apply edits, change styles, or transform elements completely.'}
            </p>
          </div>

          {mode === AppMode.GENERATE ? (
            <Generator onImageGenerated={addToGallery} />
          ) : (
            <Editor onImageGenerated={addToGallery} />
          )}
        </section>

        {/* Gallery Section */}
        {gallery.length > 0 && (
          <section className="border-t border-slate-800 pt-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Gallery <span className="text-sm font-normal text-slate-500">({gallery.length})</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((img) => (
                <div key={img.id} className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/10">
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.prompt} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <a 
                        href={img.url} 
                        download={`nanoart-${img.id}.png`}
                        className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all transform hover:scale-110"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button 
                        onClick={() => deleteFromGallery(img.id)}
                        className="p-3 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white rounded-full transition-all transform hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-slate-300 text-sm line-clamp-2" title={img.prompt}>
                      {img.prompt}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{new Date(img.createdAt).toLocaleTimeString()}</span>
                      <span className="uppercase">Gemini 2.5 Flash</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 mt-auto bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NanoArt Studio. Powered by Google Gemini.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { Download, Share2, Maximize2, Zap } from 'lucide-react';
import FileSaver from 'file-saver';

interface ResultDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, isLoading }) => {
  const handleDownload = () => {
    if (imageUrl) {
      FileSaver.saveAs(imageUrl, `outfit-studio-${Date.now()}.png`);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden relative border border-stone-200 dark:border-stone-700">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-white to-stone-100 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 space-y-4">
           <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
           <p className="text-sm tracking-widest uppercase font-medium">Creating your image...</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-full min-h-[500px] bg-stone-50 dark:bg-stone-900 rounded-2xl flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 dark:border-stone-700 transition-colors">
        <div className="p-6 bg-white dark:bg-stone-800 rounded-full mb-4 shadow-sm">
           <Maximize2 className="w-8 h-8 opacity-20 dark:opacity-40" />
        </div>
        <p className="text-lg font-serif italic text-stone-500 dark:text-stone-400">Ready to create</p>
        <p className="text-sm mt-2 max-w-xs text-center text-stone-400 dark:text-stone-500">Configure your inputs on the left to generate professional assets using Gemini 2.5.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn">
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
        <img
          src={imageUrl}
          alt="Generated Result"
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center p-6 opacity-0 group-hover:opacity-100">
          <div className="flex space-x-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-white text-stone-900 rounded-full font-medium shadow-lg hover:bg-stone-50 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              className="p-3 bg-white/90 backdrop-blur-md text-stone-900 rounded-full shadow-lg hover:bg-white"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center text-xs text-stone-400 dark:text-stone-500 px-2">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>Powered by Gemini</span>
        </div>
        <span>Generated Image</span>
      </div>
    </div>
  );
};
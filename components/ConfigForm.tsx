import React from 'react';
import { GenerationSettings } from '../types';
import { Sparkles } from 'lucide-react';

interface ConfigFormProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
  labels: {
    subject: string;
    action: string;
    surroundings: string;
    style: string;
  };
  placeholders: {
    subject: string;
    action: string;
    surroundings: string;
    style: string;
  };
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ 
  settings, 
  onChange, 
  onGenerate, 
  isGenerating,
  canGenerate,
  labels,
  placeholders
}) => {
  
  const handleChange = (field: keyof GenerationSettings, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-5">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Field 1: Subject / Model */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {labels.subject}
          </label>
          <input
            type="text"
            value={settings.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-400 focus:border-transparent outline-none transition-all placeholder:text-stone-400 bg-white dark:bg-stone-900 dark:text-white"
            placeholder={placeholders.subject}
          />
        </div>

        {/* Field 2: Action / Pose */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {labels.action}
          </label>
          <input
            type="text"
            value={settings.action}
            onChange={(e) => handleChange('action', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-400 focus:border-transparent outline-none transition-all placeholder:text-stone-400 bg-white dark:bg-stone-900 dark:text-white"
            placeholder={placeholders.action}
          />
        </div>

        {/* Field 3: Surroundings / Background */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {labels.surroundings}
          </label>
          <input
            type="text"
            value={settings.surroundings}
            onChange={(e) => handleChange('surroundings', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-400 focus:border-transparent outline-none transition-all placeholder:text-stone-400 bg-white dark:bg-stone-900 dark:text-white"
            placeholder={placeholders.surroundings}
          />
        </div>

        {/* Field 4: Style / Lighting */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {labels.style}
          </label>
          <input
            type="text"
            value={settings.style}
            onChange={(e) => handleChange('style', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-400 focus:border-transparent outline-none transition-all placeholder:text-stone-400 bg-white dark:bg-stone-900 dark:text-white"
            placeholder={placeholders.style}
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`
            w-full py-4 px-6 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all duration-300 shadow-md
            ${!canGenerate || isGenerating
              ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-100 dark:to-stone-300 text-white dark:text-stone-900 hover:shadow-xl hover:-translate-y-0.5'
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Creation</span>
            </>
          )}
        </button>
        
        {!canGenerate && !isGenerating && (
          <p className="text-center text-xs text-stone-400 mt-2">
            Please fill in the details to proceed.
          </p>
        )}
      </div>
    </div>
  );
};
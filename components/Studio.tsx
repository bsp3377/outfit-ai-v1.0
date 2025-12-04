import React, { useState, useEffect } from 'react';
import { UploadZone } from './UploadZone';
import { ConfigForm } from './ConfigForm';
import { ResultDisplay } from './ResultDisplay';
import { generateCreativeImage } from '../services/geminiService';
import { authService } from '../services/authService';
import { PurchaseModal } from './PurchaseModal';
import { ImageFile, GenerationSettings, AppStatus, AppMode, Theme, UserProfile } from '../types';
import { Camera, AlertCircle, Users, Layers, Wand2, Moon, Sun, Key, ChevronLeft, LogOut, Coins, Plus } from 'lucide-react';

interface StudioProps {
  onBack: () => void;
  user: UserProfile | null;
  onCreditUpdate: (credits: number) => void;
  onLogout: () => void;
}

export const Studio: React.FC<StudioProps> = ({ onBack, user, onCreditUpdate, onLogout }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [mode, setMode] = useState<AppMode>(AppMode.AI_MODEL);

  // State for images
  const [productImages, setProductImages] = useState<ImageFile[]>([]);
  const [modelImages, setModelImages] = useState<ImageFile[]>([]);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Settings state now has 4 specific fields
  const [settings, setSettings] = useState<GenerationSettings>({
    subject: '',
    action: '',
    surroundings: '',
    style: '',
  });

  // Handle Theme Change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check API Key on Mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          // Fallback for environments without the wrapper (e.g., local dev)
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Failed to check API key", e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Error selecting key", e);
        setError("Failed to select API key. Please try again.");
      }
    }
  };

  // Configuration for UI Labels & Placeholders per mode
  const modeConfig = {
    [AppMode.AI_MODEL]: {
      title: "AI Model Generator",
      icon: <Users className="w-5 h-5" />,
      description: "Generate a professional AI model wearing your products.",
      uploads: "Product Images",
      labels: {
        subject: "Model Details",
        action: "Pose & Expression",
        surroundings: "Background Setting",
        style: "Lighting & Mood"
      },
      placeholders: {
        subject: "e.g. Young woman, blonde hair, professional look...",
        action: "e.g. Walking towards camera, confident expression...",
        surroundings: "e.g. Urban street, blurred city background...",
        style: "e.g. Golden hour, cinematic lighting, soft focus..."
      }
    },
    [AppMode.OWN_MODEL]: {
      title: "Virtual Try-On",
      icon: <Wand2 className="w-5 h-5" />,
      description: "Upload your own model photo and dress them in your products.",
      uploads: "Product Images",
      labels: {
        subject: "Styling & Fit Instructions",
        action: "Expression Adjustments",
        surroundings: "Background Changes (Optional)",
        style: "Lighting & Color Grading"
      },
      placeholders: {
        subject: "e.g. Loose fit shirt, tucked in...",
        action: "e.g. Keep original expression, look at camera...",
        surroundings: "e.g. Keep original background, or change to white...",
        style: "e.g. Natural lighting, match product lighting..."
      }
    },
    [AppMode.FLAT_LAY]: {
      title: "Flat Lay Studio",
      icon: <Layers className="w-5 h-5" />,
      description: "Create artistic flat lay compositions of your items.",
      uploads: "Item Images",
      labels: {
        subject: "Arrangement Style",
        action: "Composition Focus",
        surroundings: "Surface Material",
        style: "Props & Lighting"
      },
      placeholders: {
        subject: "e.g. Knolling, Organized Grid, Organic Scatter...",
        action: "e.g. Hero item in center, accessories surrounding...",
        surroundings: "e.g. White Marble, Wooden Table, Pastel Background...",
        style: "e.g. Soft Daylight, Hard Shadows, Minimalist Props..."
      }
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (productImages.length === 0) return;
    if (mode === AppMode.OWN_MODEL && modelImages.length === 0) return;
    /* 
    if (user && user.credits <= 0) {
      setError("Insufficient credits. Please purchase more to continue.");
      setIsPurchaseModalOpen(true); // Open purchase modal automatically
      return;
    }
    */

    setStatus(AppStatus.GENERATING);
    setError(null);
    setGeneratedImage(null);

    try {
      // 1. Generate Image
      const resultUrl = await generateCreativeImage(
        mode,
        productImages,
        mode === AppMode.OWN_MODEL ? modelImages[0] : null,
        settings
      );

      // 2. Deduct Credit (if user is logged in)
      /*
      if (user) {
        try {
          const newBalance = await authService.deductCredit(user.uid);
          onCreditUpdate(newBalance);
        } catch (creditErr) {
          console.error("Failed to deduct credit but generation worked", creditErr);
        }
      }
      */

      setGeneratedImage(resultUrl);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      const msg = err.message || "Failed to generate image.";
      setError(msg);
      if (msg.includes("Requested entity was not found") || msg.includes("403") || msg.includes("401")) {
        setHasApiKey(false);
      }
      setStatus(AppStatus.ERROR);
    }
  };

  // Check if generation is possible (Require at least some text input + images)
  const hasTextParams = settings.subject.length > 0 || settings.action.length > 0;
  const canGenerate = Boolean(
    productImages.length > 0 &&
    (mode !== AppMode.OWN_MODEL || modelImages.length > 0) &&
    hasTextParams
  );

  const switchMode = (newMode: AppMode) => {
    setMode(newMode);
    setStatus(AppStatus.IDLE);
    setGeneratedImage(null);
    setError(null);
    // Reset inputs on mode switch for cleaner UX
    setSettings({
      subject: '',
      action: '',
      surroundings: '',
      style: '',
    });
    if (newMode !== AppMode.OWN_MODEL) {
      setModelImages([]);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- RENDER API KEY GATE ---
  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-6 left-6">
          <button onClick={onBack} className="flex items-center space-x-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
        <div className="max-w-md w-full text-center space-y-8">
          <div className="bg-yellow-500 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <Camera className="w-8 h-8 text-stone-900" />
          </div>
          <div>
            <h1 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">Outfit Studio</h1>
            <p className="text-stone-500 dark:text-stone-400">Unlock the power of Gemini 3 Pro for perfect, high-fidelity image generation.</p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800">
            <div className="mb-6 flex justify-center">
              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-full">
                <Key className="w-6 h-6 text-stone-600 dark:text-stone-300" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Access Required</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              To generate 2K resolution images with our Pro model, please select a billing-enabled API key.
            </p>
            <button
              onClick={handleSelectKey}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Connect API Key</span>
            </button>
            <p className="mt-4 text-xs text-stone-400">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-500">
                Learn about billing & API keys
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <button onClick={onBack} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors mr-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="bg-yellow-500 text-stone-900 p-2 rounded-lg shadow-lg">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif text-2xl font-semibold tracking-tight block leading-none">Outfit Studio</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:flex items-center space-x-2 px-1 py-1 pr-4 bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center px-3 py-1 bg-white dark:bg-stone-900 rounded-full shadow-sm">
                    <Coins className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm font-bold">{user.credits}</span>
                  </div>
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"
                    title="Buy Credits"
                  >
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2 border-l border-stone-200 dark:border-stone-700 pl-4 ml-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                {user && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mobile Credit Display */}
        {user && (
          <div className="md:hidden flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2 px-1 py-1 pr-4 bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700">
              <div className="flex items-center px-3 py-1 bg-white dark:bg-stone-900 rounded-full shadow-sm">
                <Coins className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-bold">{user.credits}</span>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"
              >
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-1">ADD</span>
                <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {Object.entries(modeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => switchMode(key as AppMode)}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border
                ${mode === key
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-lg scale-105'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600'
                }
              `}
            >
              {config.icon}
              <span>{config.title}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Panel: Configuration */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 transition-colors">
              <div className="flex items-center space-x-2 mb-6 text-stone-800 dark:text-stone-200">
                <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                <h2 className="font-serif text-xl font-semibold">{modeConfig[mode].title}</h2>
              </div>
              <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm">
                {modeConfig[mode].description}
              </p>

              {/* Product Uploads */}
              <div className="mb-8">
                <UploadZone
                  label={`1. Upload ${modeConfig[mode].uploads}`}
                  images={productImages}
                  onImagesChange={setProductImages}
                  maxFiles={5}
                />
              </div>

              {/* Own Model Upload (Conditional) */}
              {mode === AppMode.OWN_MODEL && (
                <div className="mb-8 animate-fadeIn">
                  <UploadZone
                    label="2. Upload Target Model"
                    images={modelImages}
                    onImagesChange={(imgs) => setModelImages(imgs.slice(0, 1))}
                    maxFiles={1}
                    acceptLabel="Full body photo recommended"
                  />
                </div>
              )}

              <hr className="border-stone-100 dark:border-stone-800 my-8" />

              <ConfigForm
                settings={settings}
                onChange={setSettings}
                onGenerate={handleGenerate}
                isGenerating={status === AppStatus.GENERATING}
                canGenerate={canGenerate}
                labels={modeConfig[mode].labels}
                placeholders={modeConfig[mode].placeholders}
              />
            </div>

            {/* Error Message */}
            {status === AppStatus.ERROR && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-300 animate-fadeIn">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>

          {/* Right Panel: Result */}
          <div className="lg:col-span-7">
            <div className="h-full flex flex-col">
              <div className="flex items-baseline justify-between mb-6 px-1">
                <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">Studio Output</h2>
                <span className="text-stone-400 dark:text-stone-600 text-xs uppercase tracking-wider font-semibold border border-stone-200 dark:border-stone-700 rounded-full px-2 py-0.5">Gemini 3 Pro</span>
              </div>
              <div className="flex-grow">
                <ResultDisplay
                  imageUrl={generatedImage}
                  isLoading={status === AppStatus.GENERATING}
                />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 mt-12 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif text-stone-400 dark:text-stone-500 italic">"Creativity is intelligence having fun."</p>
          <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-stone-300 dark:text-stone-600">
            <span>Outfit Studio v3.0</span>
            <span>•</span>
            <span>Powered by Google Gemini</span>
          </div>
        </div>
      </footer>

      {/* Credit Purchase Modal */}
      {user && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          userId={user.uid}
          onPurchaseSuccess={(newBalance) => onCreditUpdate(newBalance)}
        />
      )}
    </div>
  );
};
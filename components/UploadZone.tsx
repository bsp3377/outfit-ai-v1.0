import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { ImageFile } from '../types';

interface UploadZoneProps {
  onImagesChange: (images: ImageFile[]) => void;
  images: ImageFile[];
  maxFiles?: number;
  label: string;
  acceptLabel?: string;
}

// Allow AVIF in the input, but we will convert it
const SUPPORTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onImagesChange, 
  images, 
  maxFiles = 5,
  label,
  acceptLabel = "PNG, JPG, WEBP, AVIF, HEIC"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Helper to convert image to supported format (PNG) if it's AVIF
  const processImageFile = async (file: File): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // If AVIF, try to convert to PNG via Canvas
        if (file.type === 'image/avif') {
           const img = new Image();
           img.onload = () => {
             const canvas = document.createElement('canvas');
             canvas.width = img.width;
             canvas.height = img.height;
             const ctx = canvas.getContext('2d');
             
             if (ctx) {
               ctx.drawImage(img, 0, 0);
               const pngDataUrl = canvas.toDataURL('image/png');
               resolve({
                 id: Math.random().toString(36).substr(2, 9),
                 file, // Keep original file object reference for generic usage
                 previewUrl: pngDataUrl, // Use PNG for preview
                 base64: pngDataUrl.split(',')[1], // Use PNG base64
                 mimeType: 'image/png', // Pretend it is PNG now
               });
               return;
             }
             // Context failed, fall back to original
             resolve({
                id: Math.random().toString(36).substr(2, 9),
                file,
                previewUrl: result,
                base64: result.split(',')[1],
                mimeType: file.type,
             });
           };
           img.onerror = () => {
             // Image load failed (browser doesn't support AVIF?), return original
             resolve({
                id: Math.random().toString(36).substr(2, 9),
                file,
                previewUrl: result,
                base64: result.split(',')[1],
                mimeType: file.type,
             });
           };
           img.src = result;
        } else {
           // Standard supported formats
           resolve({
             id: Math.random().toString(36).substr(2, 9),
             file,
             previewUrl: result,
             base64: result.split(',')[1],
             mimeType: file.type,
           });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList) => {
    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) return;

    // Filter valid files first
    const candidates = Array.from(fileList).slice(0, remainingSlots);
    const validFiles = candidates.filter(file => SUPPORTED_MIME_TYPES.includes(file.type));

    if (validFiles.length < candidates.length) {
        console.warn("Skipped unsupported file types.");
    }

    if (validFiles.length === 0) return;

    // Process all files in parallel
    const processedImages = await Promise.all(validFiles.map(processImageFile));
    onImagesChange([...images, ...processedImages]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [images, maxFiles, onImagesChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      // Reset input value to allow selecting the same file again if deleted
      e.target.value = '';
    }
  };

  const removeImage = (idToRemove: string) => {
    onImagesChange(images.filter(img => img.id !== idToRemove));
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
        {label} <span className="text-stone-400 text-xs ml-2">({images.length}/{maxFiles})</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 group">
            <img 
              src={img.previewUrl} 
              alt="Upload preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Tag badge for converted AVIFs just for info, optional */}
            {img.file.type === 'image/avif' && (
              <span className="absolute bottom-1 right-1 text-[8px] bg-black/40 text-white px-1 rounded">AVIF</span>
            )}
          </div>
        ))}
        
        {images.length < maxFiles && (
           <div
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}
           className={`
             relative aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
             ${isDragging 
               ? 'border-stone-800 bg-stone-100 dark:border-stone-400 dark:bg-stone-800' 
               : 'border-stone-300 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500 bg-white dark:bg-stone-900'}
           `}
         >
           <input
             type="file"
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             onChange={handleFileChange}
             accept="image/png, image/jpeg, image/webp, image/heic, image/heif, image/avif"
             multiple
           />
           <div className="flex flex-col items-center space-y-2 text-stone-500 dark:text-stone-400 p-2 text-center">
             <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-full">
               {images.length === 0 ? <Upload className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
             </div>
             <div className="hidden sm:block">
               <p className="text-xs font-semibold">{images.length === 0 ? "Upload Photos" : "Add More"}</p>
               {images.length === 0 && <p className="text-[10px] mt-1">{acceptLabel}</p>}
             </div>
           </div>
         </div>
        )}
      </div>
    </div>
  );
};
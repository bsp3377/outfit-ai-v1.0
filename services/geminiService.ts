import { GoogleGenAI } from "@google/genai";
import { AppMode, GenerationSettings, ImageFile } from '../types';

// Using Gemini 3 Pro Image Preview for "Perfect Generation"
const MODEL_NAME = 'gemini-3-pro-image-preview';

// Helper to validate mime types
const validateMimeType = (mimeType: string) => {
  // AVIF is handled via conversion in the frontend, so we expect standard types here
  const supported = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
  if (!supported.includes(mimeType)) {
    throw new Error(`Unsupported image format: ${mimeType}. Please use PNG, JPEG, WEBP, or HEIC.`);
  }
};

export const generateCreativeImage = async (
  mode: AppMode,
  productImages: ImageFile[],
  modelImage: ImageFile | null,
  settings: GenerationSettings
): Promise<string> => {
  try {
    // Instantiate client here to ensure we capture the latest API Key if it was just selected
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [];

    // 1. Add Product Images (Garments/Gadgets)
    productImages.forEach((img) => {
      validateMimeType(img.mimeType);
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      });
    });

    // 2. Add Model Image (only for OWN_MODEL mode)
    if (mode === AppMode.OWN_MODEL && modelImage) {
      validateMimeType(modelImage.mimeType);
      parts.push({
        inlineData: {
          mimeType: modelImage.mimeType,
          data: modelImage.base64,
        },
      });
    }

    // 3. Construct Prompt based on Mode and Structured Settings
    let systemPrompt = "";
    
    // Enforce high quality keywords
    const qualityEnforcement = "High fidelity, 2K resolution, highly detailed, photorealistic, masterpiece, professional photography, sharp focus, perfect lighting.";

    const details = `
      Subject/Model Details: ${settings.subject}
      Pose/Action: ${settings.action}
      Background/Surroundings: ${settings.surroundings}
      Style/Lighting: ${settings.style}
    `;

    if (mode === AppMode.AI_MODEL) {
      systemPrompt = `
        Task: High-End Fashion & Product Photography.
        Inputs: The first ${productImages.length} images are the products.
        Instruction: Generate a stunning, photorealistic image of a professional model wearing these products.
        
        Detailed Configuration:
        ${details}
        
        Mandates:
        - The model must look absolutely real with natural skin texture and perfect features.
        - The product must be the clear hero of the shot, integrated seamlessly.
        - Use professional studio lighting techniques (Rembrandt, Butterfly, or Softbox).
        - ${qualityEnforcement}
      `;
    } else if (mode === AppMode.OWN_MODEL) {
      systemPrompt = `
        Task: Professional Virtual Try-On & Editing.
        Inputs: The first ${productImages.length} images are the products. The LAST image provided is the target person.
        Instruction: Edit the target person's photo to make them wear/use the provided products naturally and realistically.
        
        Detailed Configuration:
        ${details}
        
        Mandates:
        - Maintain the person's identity, facial features, and body shape exactly.
        - The clothing fold, drape, and lighting interaction must be physically accurate.
        - ${qualityEnforcement}
      `;
    } else if (mode === AppMode.FLAT_LAY) {
      systemPrompt = `
        Task: Artistic Flat Lay Composition.
        Inputs: The provided images are items to be arranged.
        Instruction: Create an award-winning flat lay composition.
        
        Detailed Configuration:
        ${details}
        
        Mandates:
        - Perfect alignment and spacing (knolling or organic balance).
        - High-end commercial look suitable for a luxury magazine.
        - ${qualityEnforcement}
      `;
    }

    // Add text prompt to parts
    parts.push({ text: systemPrompt });

    // Determine Aspect Ratio based on Mode
    // AI_MODEL & OWN_MODEL -> 3:4 (Portrait/Fashion standard)
    // FLAT_LAY -> 4:3 (Landscape/Tabletop standard)
    const aspectRatio = mode === AppMode.FLAT_LAY ? "4:3" : "3:4";

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          imageSize: '2K', // Request high resolution for "perfect" generation
          aspectRatio: aspectRatio,
        }
      }
    });

    // Parse response to find the generated image
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            return `data:image/png;base64,${base64Data}`;
          }
        }
      }
    }

    throw new Error("No image generated in the response.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
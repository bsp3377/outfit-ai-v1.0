export interface GenerationSettings {
  subject: string;      // Model Description / Arrangement
  action: string;       // Pose / Composition
  surroundings: string; // Background / Surface
  style: string;        // Lighting / Filter / Mood
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum AppMode {
  AI_MODEL = 'AI_MODEL',
  OWN_MODEL = 'OWN_MODEL',
  FLAT_LAY = 'FLAT_LAY',
}

export type Theme = 'light' | 'dark';

export interface UserProfile {
  uid: string;
  email: string | null;
  credits: number;
  displayName?: string;
  username?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  features: string[];
}

// Global AIStudio definition
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}
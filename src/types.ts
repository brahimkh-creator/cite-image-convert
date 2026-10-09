export type SupportedFormat = 
  | 'image/png' 
  | 'image/jpeg' 
  | 'image/webp' 
  | 'image/avif' 
  | 'image/bmp' 
  | 'image/x-icon' 
  | 'image/svg+xml';

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  width: number;
  height: number;
  
  // Output states
  targetFormat: SupportedFormat;
  quality: number; // 0 to 100
  scalePercent: number; // 10 to 100
  maxWidth?: number;
  maxHeight?: number;
  
  // Result
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  resultWidth?: number;
  resultHeight?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  timeTakenMs?: number;
  savingsPercent?: number;
}

export type TabType = 'convert' | 'compress' | 'ai-studio' | 'batch';

export type AIToolType = 
  | 'bg-remover' 
  | 'magic-eraser' 
  | 'super-resolution' 
  | 'auto-enhance' 
  | 'smart-filters'
  | 'color-adjust';

export interface AIProcessingOptions {
  tool: AIToolType;
  
  // BG Remover
  bgMode?: 'transparent' | 'color' | 'blur';
  bgColor?: string;
  featherRadius?: number;
  
  // Magic Eraser
  maskCanvas?: HTMLCanvasElement;
  inpaintRadius?: number;
  
  // Super Resolution
  scaleFactor?: 2 | 4;
  sharpnessLevel?: number; // 1 to 5
  
  // Auto Enhance
  enhanceVibrance?: boolean;
  enhanceShadows?: boolean;
  autoContrast?: boolean;
  
  // Smart Filters
  filterPreset?: 'cyberpunk' | 'cinematic' | 'bw-pro' | 'golden-hour' | 'vintage' | 'vivid';
  
  // Color adjustments
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  saturation?: number; // -100 to 100
  sharpness?: number;  // 0 to 100
  blur?: number;       // 0 to 20
}

export interface NetworkStat {
  bytesUploaded: number;
  bytesDownloaded: number;
  isFullyOffline: boolean;
  localOperationsCount: number;
}

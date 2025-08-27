export interface UploadedFile {
  dataUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface GenerationForm {
  prompt: string;
  style: string;
  imageDataUrl: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  abortController: AbortController | null;
}

export const STYLE_OPTIONS = [
  { value: "editorial", label: "Editorial" },
  { value: "streetwear", label: "Streetwear" },
  { value: "vintage", label: "Vintage" },
  { value: "minimalist", label: "Minimalist" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "watercolor", label: "Watercolor" },
] as const;

export const MAX_RETRY_COUNT = 3;
export const STORAGE_KEY = "ai-studio-history";
export const MAX_HISTORY_ITEMS = 5;

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export enum AppMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT'
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: string;
  count: number;
}

export interface EditConfig {
  prompt: string;
  sourceImageBase64: string;
  sourceImageMimeType: string;
}

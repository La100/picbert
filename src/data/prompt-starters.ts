export interface PromptStarter {
  id: string;
  name: string;
  prompt: string;
  previewImageUrl: string;
}

export const promptStarters: PromptStarter[] = [
  {
    id: "casual",
    name: "Casual Style",
    prompt: "A person in casual everyday clothing, natural pose, urban environment",
    previewImageUrl: "https://bucket.facesfactory.com/prompstarters/generated-image-1739396361865.png"
  },

  
]; 
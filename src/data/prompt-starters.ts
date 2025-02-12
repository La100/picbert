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
    previewImageUrl: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/prompstarters//generated-image-1739396361865.png"
  },
  {
    id: "professional",
    name: "Professional Look",
    prompt: "A person in business attire, confident pose, office setting",
    previewImageUrl: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/prompstarters//generated-image-1739396389102.png"
  },
  
]; 
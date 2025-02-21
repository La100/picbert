import { promptStarters } from "@/data/prompt-starters";
import Image from "next/image";

interface PromptStarterProps {
  onSelect: (prompt: string) => void;
}

export function PromptStarterSelector({ onSelect }: PromptStarterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {promptStarters.map((starter) => (
        <button
          type="button"
          key={starter.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(starter.prompt);
          }}
          className="relative group overflow-hidden rounded-lg hover:ring-1 hover:ring-primary transition-all w-[100px] h-[100px]"
        >
          <div className="relative w-full h-full">
            <Image
              src={starter.previewImageUrl}
              alt={starter.name}
              fill
              className="object-cover"
              sizes="100px"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium px-1 text-center">
                {starter.name}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
} 
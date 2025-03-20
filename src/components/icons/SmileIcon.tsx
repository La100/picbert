import { Smile } from "lucide-react";

interface SmileIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export function SmileIcon({
  size = 24,
  className = "",
  color = "currentColor"
}: SmileIconProps) {
  return (
    <Smile
      size={size}
      className={className}
      color={color}
      strokeWidth={2}
    />
  );
} 
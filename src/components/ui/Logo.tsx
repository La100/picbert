import Link from "next/link";
import { SmileIcon } from "../icons/SmileIcon";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export function Logo({ 
  className, 
  size = 32, 
  withText = true 
}: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center p-1 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-600">
        <SmileIcon size={size} className="text-white" />
      </div>
      {withText && (
        <span className="font-semibold">Faces Factory</span>
      )}
    </Link>
  );
} 
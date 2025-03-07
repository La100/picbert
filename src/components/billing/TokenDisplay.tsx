"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useSidebar } from "../ui/sidebar"
import { Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import useTokenStore from "@/store/useTokenStore"

interface TokenDisplayProps {
  tokens: number
}

export default function TokenDisplay({ tokens }: TokenDisplayProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { tokenCount, setTokenCount, refreshTokens } = useTokenStore()
  
  // Inicjalizacja stanu przy pierwszym renderowaniu
  useEffect(() => {
    if (tokenCount === null) {
      setTokenCount(tokens);
      // Odświeżanie przy montowaniu komponentu
      refreshTokens();
    }
  }, [tokens, tokenCount, setTokenCount, refreshTokens]);

  const handleClick = () => {
    // Close the mobile sidebar when clicked
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Użyj globalnego stanu tokenCount, jeśli istnieje, w przeciwnym razie użyj props tokens
  const displayTokens = tokenCount !== null ? tokenCount : tokens;

  return (
    <Link href="/billing" className="inline-block w-full" onClick={handleClick}>
      <div className={cn(
        "flex items-center gap-2 p-2 mb-2 text-sm font-medium rounded-md",
        "bg-muted/50 hover:bg-muted transition-colors",
        "border border-border/40"
      )}>
        <Coins className="h-4 w-4 text-primary" />
        <span>{displayTokens.toLocaleString()} Tokens</span>
      </div>
    </Link>
  )
} 
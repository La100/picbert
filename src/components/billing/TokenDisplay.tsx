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
  
  // Always refresh tokens when component mounts to avoid cached values
  useEffect(() => {
    // Initialize with props value
    setTokenCount(tokens);
    // Always refresh tokens on mount to get latest data
    refreshTokens();
    
    // Set up interval to refresh tokens every 30 seconds while sidebar is open
    const refreshInterval = setInterval(() => {
      refreshTokens();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [tokens, setTokenCount, refreshTokens]);

  const handleClick = () => {
    // Close the mobile sidebar when clicked
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Use global state tokenCount if available, otherwise use props tokens
  const displayTokens = tokenCount !== null ? tokenCount : tokens;

  return (
    <Link href="/billing" className="inline-block w-full" onClick={handleClick}>
      <div className={cn(
        "flex items-center gap-2 p-2 mb-2 text-sm font-medium rounded-md",
        "bg-muted/50 hover:bg-muted transition-colors",
        "border border-border/40"
      )}>
        <Coins className="h-4 w-4 text-primary" />
        <span>{displayTokens.toLocaleString('en-US')} Tokens</span>
      </div>
    </Link>
  )
} 
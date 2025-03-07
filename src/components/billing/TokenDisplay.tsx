"use client"

import Link from "next/link"
import { useSidebar } from "../ui/sidebar"
import { Coins } from "lucide-react"
import { cn } from "@/lib/utils"

interface TokenDisplayProps {
  tokens: number
}

export default function TokenDisplay({ tokens }: TokenDisplayProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = () => {
    // Close the mobile sidebar when clicked
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Link href="/billing" className="inline-block w-full" onClick={handleClick}>
      <div className={cn(
        "flex items-center gap-2 p-2 mb-2 text-sm font-medium rounded-md",
        "bg-muted/50 hover:bg-muted transition-colors",
        "border border-border/40"
      )}>
        <Coins className="h-4 w-4 text-primary" />
        <span>{tokens.toLocaleString()} Tokens</span>
      </div>
    </Link>
  )
} 
"use client"

import Link from "next/link"
import { RainbowButton } from "../ui/rainbow-button"
import { useSidebar } from "../ui/sidebar"

export default function UpgradeBtn() {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = () => {
    // Close the mobile sidebar when clicked
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Link href="/billing" className="inline-block w-full" onClick={handleClick}>
      <RainbowButton 
        className="w-full text-sm font-semibold rounded-md mb-2"
      >
        Upgrade Plan ✨
      </RainbowButton>
    </Link>
  )
}

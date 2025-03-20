import React from 'react'
import Link from 'next/link'
import { SmileIcon } from './icons/SmileIcon'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative flex items-center justify-center p-1 overflow-hidden rounded-full bg-black">
        <SmileIcon size={24} className="text-white" />
      </div>
      <span className="text-lg font-semibold">Faces Factory</span>
    </Link>
  )
}

export default Logo
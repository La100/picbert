"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useSidebar } from "@/components/ui/sidebar";

const ActiveLink = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        className,
        "rounded-none",
        pathname === href
          ? "text-primary bg-primary/5"
          : "text-muted-foreground "
      )}
    >
      {children}
    </Link>
  );
};

export default ActiveLink;

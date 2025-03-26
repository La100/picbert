"use client"

import {
  BadgeCheck,
  Settings,
  CreditCard,
  LogOut,
  HelpCircle,
  Info,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import LogoutBtn from "./authentication/LogoutBtn"
import Link from "next/link"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    picture?: string
  }
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = () => {
    // Close the mobile sidebar when clicked
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {user.picture ? (
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="rounded-full font-medium bg-primary text-primary-foreground text-sm">{user?.name && user?.name?.split(" ").map(name => name[0]).join("")}</AvatarFallback>
                </Avatar>
              ) : null}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-[450]">{user.email}</span>
              </div>
              <Settings className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {user.picture ? (
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={user.picture} alt={user.name} />
                    <AvatarFallback className="rounded-full font-medium bg-primary text-primary-foreground text-xs">{user?.name?.split(" ").map(name => name[0]).join("")}</AvatarFallback>
                  </Avatar>
                ) : null}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <Link href="/account-settings" className="w-full cursor-pointer" onClick={handleClick}>
                <DropdownMenuItem className="cursor-pointer">
                  <BadgeCheck />
                  Settings
                </DropdownMenuItem>
              </Link>
              <Link href="/billing" className="w-full cursor-pointer" onClick={handleClick}>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard />
                  Billing
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Info className="size-4 mr-2" />
                  Learn More
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <Link href="/privacy-policy" className="w-full">
                    <DropdownMenuItem className="cursor-pointer">
                      Privacy Policy
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/terms-of-use" className="w-full">
                    <DropdownMenuItem className="cursor-pointer">
                      Terms of Use
                    </DropdownMenuItem>
                  </Link>
                 
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <Link href="/help" className="w-full cursor-pointer">
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="size-4" />
                  Get Help
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="size-4 text-destructive" />
              <LogoutBtn />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

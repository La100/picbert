"use server"

import * as React from "react"
import {
  Image,
  ImagePlus,
  SquareTerminal,
  Video,
  FileVideo,
  Users,
  ShoppingBag
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UpgradeBtn from "./billing/UpgradeBtn"
import { getSubscription } from "@/lib/supabase/queries"
import { SmileIcon } from "./icons/SmileIcon"

const navMain =  [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "AI People Library",
      url: "/video-library",
      icon: Users,
    },                          
    {
      title: "Create a Person",
      url: "/image-generation",
      icon: ImagePlus,
    },
    {
      title: "Generate Videos",
      url: "/video-generation",
      icon: FileVideo,
    },
    {
      title: "Your Images",
      url: "/gallery/images",
      icon: Image,
    },
    {
      title: "Your Videos",
      url: "/gallery/videos",
      icon: Video,
    },
    {
      title: "Add product to image",
      icon: ShoppingBag,
      isActive: false,
      isDisabled: true,
      badge: "Coming soon",
    },
  ]

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) {
    redirect('/login')
  }
  const user = {
    name: session.user.user_metadata.full_name,
    email: session.user.email ?? "",
    picture: session.user.user_metadata.picture ?? null,
  }

  const subscription = await getSubscription(supabase);
  const currentPlanName = subscription?.prices.products.name || "Free";
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-5">
      <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white">
                <SmileIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium">
                  Faces Factory
                </span>
                <span className="truncate text-sm">{currentPlanName}</span>
              </div>
            </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="pt-10">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="pb-5">
        {subscription?.status === 'active' 
          ? null
          : <UpgradeBtn />
        }
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

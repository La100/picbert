import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import ActiveLink from "./dashboard/ActiveLink";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isDisabled?: boolean;
    badge?: string;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (item.items) {
              return (
                <Collapsible key={item.title}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={item.title} className="font-normal text-base">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronDown className="h-5 w-5" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {item.items.map((subItem) => (
                      <ActiveLink href={subItem.url} key={subItem.title}>
                        <SidebarMenuItem className="pl-6">
                          <SidebarMenuButton tooltip={subItem.title} className="font-normal text-base">
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </ActiveLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // If item is disabled, render it without link
            if (item.isDisabled) {
              return (
                <SidebarMenuItem key={item.title}>
                  <div className="flex flex-col">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="font-[450] text-base opacity-60 cursor-not-allowed"
                      aria-disabled="true"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-primary/10 text-primary rounded-md text-xs ml-9  relative w-fit">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </div>
                </SidebarMenuItem>
              );
            }

            return (
              <ActiveLink href={item.url!} key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={item.title} className="font-[450]  text-base  ">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </ActiveLink>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

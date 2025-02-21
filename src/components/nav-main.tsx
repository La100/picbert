import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
                        <ChevronDown className="h-4 w-4" />
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

            return (
              <ActiveLink href={item.url!} key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={item.title} className="font-normal text-base">
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

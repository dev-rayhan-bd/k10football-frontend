"use client";

import React, { useMemo } from "react";
import { type Icon, IconLock } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SidebarItem } from "@/components/AppSidebar";

const NavDocuments = ({
  items,
}: {
  items: SidebarItem[];
}) => {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const pathName = usePathname();

  const handleItemClick = (e: React.MouseEvent, item: SidebarItem) => {
    if (item.isLocked) {
      e.preventDefault();
      toast.error(
        item.lockedMessage ||
          "Verification or active subscription required to access this feature."
      );
      const fallbackRedirect = pathName.startsWith("/dashboard/agent")
        ? "/dashboard/agent/licensed-verification"
        : pathName.startsWith("/dashboard/club")
        ? "/dashboard/club/my-subscription"
        : pathName.startsWith("/dashboard/player")
        ? "/dashboard/player/my-subscription"
        : pathName.startsWith("/dashboard/parent")
        ? "/dashboard/parent/my-subscription"
        : "/dashboard/coach/my-subscription";
      router.push(item.lockedRedirectUrl || fallbackRedirect);
      setOpenMobile?.(false);
      return;
    }
    setOpenMobile?.(false);
  };

  // Find the single active item that best matches current pathname (longest/most specific match)
  const activeItemUrl = useMemo(() => {
    // 1. Exact match has highest priority
    const exactMatch = items.find((item) => !item.isLocked && item.url === pathName);
    if (exactMatch) return exactMatch.url;

    // 2. Otherwise find prefix match with the longest/most specific URL
    const prefixMatches = items
      .filter((item) => !item.isLocked && pathName.startsWith(`${item.url}/`))
      .sort((a, b) => b.url.length - a.url.length);

    return prefixMatches[0]?.url || null;
  }, [items, pathName]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {items.map((item) => {
          const isLocked = Boolean(item.isLocked);
          const isActive = !isLocked && item.url === activeItemUrl;

          return (
            <SidebarMenuItem
              className={cn(
                "mb-2 transition-colors",
                isActive
                  ? "bg-[#E31B23] rounded-lg text-white"
                  : isLocked
                  ? "text-muted-foreground/60 hover:bg-white/5 hover:text-muted-foreground rounded-lg"
                  : "text-gray-400 hover:bg-white/5 hover:text-white rounded-lg",
              )}
              key={item.name}
            >
              <SidebarMenuButton className="py-6 hover:bg-transparent" asChild>
                <Link
                  href={
                    isLocked
                      ? item.lockedRedirectUrl ||
                        (pathName.startsWith("/dashboard/agent")
                          ? "/dashboard/agent/licensed-verification"
                          : "/dashboard/coach/my-subscription")
                      : item.url
                  }
                  onClick={(e) => handleItemClick(e, item)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 shrink-0">
                      <item.icon size={24} />
                    </div>
                    <span className="text-[15px] font-medium truncate">
                      {item.name}
                    </span>
                    {/* Sits right after the label so the sidebar scroll area can't clip it. */}
                    {isLocked && (
                      <IconLock
                        size={16}
                        className="shrink-0 text-destructive"
                        aria-label="Subscription required"
                      />
                    )}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavDocuments;

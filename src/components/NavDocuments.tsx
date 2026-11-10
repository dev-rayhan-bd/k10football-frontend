"use client";

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
        : "/dashboard/coach/my-subscription";
      router.push(item.lockedRedirectUrl || fallbackRedirect);
      setOpenMobile?.(false);
      return;
    }
    setOpenMobile?.(false);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {items.map((item) => {
          const isLocked = Boolean(item.isLocked);
          const isActive =
            !isLocked &&
            (pathName === item.url ||
              (item.url !== "/dashboard/coach" &&
                item.url !== "/dashboard/player" &&
                item.url !== "/dashboard/club" &&
                item.url !== "/dashboard/academy" &&
                item.url !== "/dashboard/agent" &&
                pathName.startsWith(`${item.url}/`)));

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
                  </div>

                  {isLocked && (
                    <div
                      className="shrink-0 flex items-center justify-center size-6 rounded-md bg-white/5 text-muted-foreground ml-2"
                      title="Subscription Required"
                    >
                      <IconLock size={14} />
                    </div>
                  )}
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

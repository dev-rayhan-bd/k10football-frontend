"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0);

    // Some custom layouts use internal scrollable containers (like SidebarInset).
    // Find all potential main scroll containers and reset their scroll as well.
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, main');
    scrollContainers.forEach((container) => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}

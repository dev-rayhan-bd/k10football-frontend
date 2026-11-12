"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";

const AcademyFinanceRedirectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("connect_status") || "";
    const targetUrl = status 
      ? `/dashboard/academy/management/settings?connect_status=${encodeURIComponent(status)}`
      : "/dashboard/academy/management/settings";
    
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
        <IconLoader2 className="size-8 animate-spin" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse font-orbitron tracking-wider">
        Returning to K10 Football Academy Payout Settings...
      </p>
    </div>
  );
};

export default function AcademyFinancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <AcademyFinanceRedirectContent />
    </Suspense>
  );
}


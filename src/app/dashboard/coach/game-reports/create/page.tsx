/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import CreateGameReport from "@/components/user-wise-dashboard/coach-dashboard/CreateGameReport";

const CoachCreateGameReportPage = () => {
  const router = useRouter();

  return (
    <div className="container py-10">
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-white">Loading...</div>}>
        <CreateGameReport 
          onCancel={() => router.push("/dashboard/coach/game-reports")} 
        />
      </Suspense>
    </div>
  );
};

export default CoachCreateGameReportPage;

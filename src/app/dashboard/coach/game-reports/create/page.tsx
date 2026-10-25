/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CreateGameReport from "@/components/user-wise-dashboard/coach-dashboard/CreateGameReport";
import { addReport } from "@/lib/constants/reports";

const CoachCreateGameReportPage = () => {
  const router = useRouter();

  return (
    <div className="container py-10">
      <CreateGameReport 
        onCancel={() => router.push("/dashboard/coach/game-reports")} 
      />
    </div>
  );
};

export default CoachCreateGameReportPage;

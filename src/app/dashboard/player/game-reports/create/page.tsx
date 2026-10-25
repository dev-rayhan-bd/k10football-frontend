/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import CreateGameReport from "@/components/user-wise-dashboard/coach-dashboard/CreateGameReport";

import { addReport } from "@/lib/constants/reports";

const CreateGameReportPage = () => {
  const router = useRouter();

  return (
    <div className="py-10">
      <CreateGameReport 
        onCancel={() => router.push("/dashboard/player/game-reports")} 
      />
    </div>
  );
};

export default CreateGameReportPage;

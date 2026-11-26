"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { EvaluationSheet } from "@/components/evaluations/EvaluationSheet";

/** Academy view of one evaluation sheet. `:id` = evaluation id or player id (latest). Read-only. */
export const PlayerEvaluationDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const searchParams = useSearchParams();
  const autoDownload = searchParams?.get("download") === "1";

  return (
    <div className="flex flex-col gap-6 pb-12 w-full max-w-full overflow-x-hidden">
      <EvaluationSheet
        evaluationId={id}
        pdfSource="academy"
        autoDownload={autoDownload}
        leading={
          <Button variant="ghost" onClick={() => router.back()} className="uppercase tracking-wider text-xs font-bold">
            <IconArrowLeft />
            Back to Evaluations
          </Button>
        }
      />
    </div>
  );
};

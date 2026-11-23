import { Suspense } from "react";
import ExternalEvaluationPage from "@/components/external-evaluation/ExternalEvaluationPage";

// Public page opened from the external coach's email:
// /game-report/evaluate?token=<token>&position=<POSITION>
// No login — the token in the URL is the credential.
export default function GameReportEvaluatePage() {
  return (
    <Suspense fallback={null}>
      <ExternalEvaluationPage />
    </Suspense>
  );
}

import { Suspense } from "react";
import FullEditableCv from "@/components/cvs/coach-cv-details/FullEditableCv";

// Shared coach CV link (Share Agent): just the CV — no marketing sections.
const CoachCVPage = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 min-w-0">
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading coach profile...</div>}>
        <FullEditableCv editable={true} />
      </Suspense>
    </div>
  );
};

export default CoachCVPage;

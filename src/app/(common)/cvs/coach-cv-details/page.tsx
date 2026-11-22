import { Suspense } from "react";
import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";
import FullEditableCv from "@/components/cvs/coach-cv-details/FullEditableCv";

const CoachCVPage = () => {
  return (
    <div>
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading coach profile...</div>}>
        <FullEditableCv editable={true} />
      </Suspense>
      <ImageCarousel />
      <StartJourneySection />
    </div>
  );
};

export default CoachCVPage;

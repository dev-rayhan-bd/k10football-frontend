import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";
import FullEditableCv from "@/components/cvs-page/coach-cv-details/FullEditableCv";

const CoachCVPage = () => {
  return (
    <div>
      <FullEditableCv editable={true} />
      <ImageCarousel />
      <StartJourneySection />
    </div>
  );
};

export default CoachCVPage;

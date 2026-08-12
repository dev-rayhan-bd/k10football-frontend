import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";
import FullEditablePage from "@/components/cvs-page/player-cv-details/FullEditablePage";

const PlayerCvDetailsPage = () => {
  return (
    <>
      <FullEditablePage editable={true} />
      <ImageCarousel />
      <StartJourneySection />
    </>
  );
};

export default PlayerCvDetailsPage;

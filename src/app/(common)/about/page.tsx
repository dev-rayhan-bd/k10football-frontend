import React from "react";
import ServiceSection from "@/components/about/ServiceSection";
import OutStorySection from "@/components/about/OutStorySection";
import OutValueSection from "@/components/about/OutValueSection";
import TimelineSection from "@/components/about/TimelineSection";
import TeamSection from "@/components/about/TeamSection";
import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";

const AboutPage = () => {
  return (
    <div>
      <ServiceSection />
      <OutStorySection/>
      <OutValueSection/>
      <TimelineSection/>
      <TeamSection/>
      <ImageCarousel/>
      <StartJourneySection/>
    </div>
  );
};

export default AboutPage;

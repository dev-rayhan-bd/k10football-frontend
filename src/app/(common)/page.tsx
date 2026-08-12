import React from "react";
import HeroSection from "@/components/common/HeroSection";
import StatsSection from "@/components/common/StatsSection";
import KeyFeatureSection from "@/components/common/KeyFeatureSection";
import HowK10Works from "@/components/common/HowK10Works";
import ChooseYourRoleSection from "@/components/common/ChooseYourRoleSection";
import MembershipPlanSection from "@/components/common/MembershipPlanSection";
import AdSection1 from "@/components/common/AdSection1";
import AdSection2 from "@/components/common/AdSection2";
import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";

const HomePage = () => {
  return (
    <>
      <HeroSection/>
      <StatsSection/>
      <KeyFeatureSection/>
      <StatsSection/>
      <HowK10Works/>
      <ChooseYourRoleSection/>
      <MembershipPlanSection/>
      <AdSection1/>
      <AdSection2/>
      <ImageCarousel/>
      <StartJourneySection/>
    </>
  );
};

export default HomePage;

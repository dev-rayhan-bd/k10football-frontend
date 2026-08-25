"use client";

import { usePlayerStats } from "@/components/cvs/player-cv-details/FullEditablePage";
import { CoachPersonalInfo } from "./bio-components/CoachPersonalInfo";
import { CoachSeasonStats } from "./bio-components/CoachSeasonStats";
import { CoachTransferStatus } from "./bio-components/CoachTransferStatus";
import { CoachCupHistory } from "./bio-components/CoachCupHistory";
import { CoachAccomplishments } from "./bio-components/CoachAccomplishments";
import { CoachLanguages } from "./bio-components/CoachLanguages";
import { CoachProfileImage } from "./bio-components/CoachProfileImage";
import { CoachKeySkills } from "./bio-components/CoachKeySkills";

const CoachBioSection = ({ editable }: { editable?: boolean }) => {
  const { role } = usePlayerStats();
  const canEdit = !!(editable && (role === "coach" || role === "admin" || !role));

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* LEFT COLUMN */}
          <div className="contents xl:block xl:col-span-4 h-fit xl:space-y-6 w-full">
            {/* PART 1: Personal Info & Contact */}
            <CoachPersonalInfo canEdit={canEdit} />

            {/* PART 2: Languages, Season Stats, Transfer, Cup, Accomplishments, Trophies */}
            <div className="col-span-12 order-3 xl:order-0 bg-cardBg rounded-2xl md:rounded-none w-full overflow-hidden flex flex-col">
              <CoachLanguages canEdit={canEdit} />

              {/* MOBILE ONLY: Current Season Stats */}
              <CoachSeasonStats canEdit={canEdit} wrapperClassName="order-2 xl:hidden" />

              {/* MOBILE ONLY: Transfer Status */}
              <CoachTransferStatus canEdit={canEdit} wrapperClassName="order-3 xl:hidden" />

              {/* MOBILE ONLY: CUP PLAYED */}
              <CoachCupHistory canEdit={canEdit} wrapperClassName="order-4 xl:hidden" />

              <CoachAccomplishments canEdit={canEdit} />
            </div>
          </div>

          {/* CENTER COLUMN - PLAYER IMAGE */}
          <CoachProfileImage canEdit={canEdit} />

          {/* RIGHT COLUMN */}
          <div className="col-span-12 order-4 xl:order-0 xl:col-span-4 space-y-6 bg-cardBg h-fit">
            {/* Current Season Stats (Desktop Only) */}
            <CoachSeasonStats canEdit={canEdit} wrapperClassName="hidden xl:block" />

            {/* Transfer Status (Desktop Only) */}
            <CoachTransferStatus canEdit={canEdit} wrapperClassName="hidden xl:block" />

            {/* CUP PLAYED (Desktop Only) */}
            <CoachCupHistory canEdit={canEdit} wrapperClassName="hidden xl:block" />

            {/* Key Skills */}
            <CoachKeySkills canEdit={canEdit} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachBioSection;

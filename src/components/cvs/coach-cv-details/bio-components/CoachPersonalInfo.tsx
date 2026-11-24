import CMSField from "@/components/shared/CMSField";
import Image from "next/image";
import { useCoach } from "@/hooks/useCoach";
import { ALL_COUNTRIES } from "./constants";
import { calculateAge, getFlagUrl } from "./utils";

const FlagThumb = ({ country, alt }: { country?: string; alt: string }) =>
  country && getFlagUrl(country) ? (
    <div className="relative w-5 h-3.5 sm:w-6 sm:h-4 overflow-hidden rounded-sm border border-border shrink-0">
      <Image
        src={getFlagUrl(country)}
        alt={alt}
        fill
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.srcset = "";
          target.src = "/placeholder_img.jpg";
        }}
      />
    </div>
  ) : null;

// Same structure and styling as the player's PersonalInfoContactCard.
export const CoachPersonalInfo = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();

  return (
    // No overflow-hidden: the country dropdowns must be able to extend
    // past the bottom of the card.
    <div className="col-span-12 order-1 xl:order-0 bg-cardBg rounded-2xl md:rounded-none w-full min-w-0 flex flex-col">
      {/* Personal Information */}
      <div className="p-4 sm:p-6 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Personal Information
        </h2>
        <div className="flex flex-col gap-3 text-xs sm:text-sm w-full min-w-0 uppercase">
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Full Name</span>
            <CMSField
              value={coachData.fullName}
              onUpdate={(val) => handleUpdate("fullName", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 truncate"
            />
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Date of Birth</span>
            <CMSField
              value={coachData.dob}
              type="date"
              onUpdate={(val) => {
                handleUpdate("dob", val);
                const newAge = calculateAge(String(val));
                if (newAge !== "") {
                  handleUpdate("age", `${newAge}`);
                }
              }}
              canEdit={canEdit}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-sm"
            />
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Age</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-white">{coachData.age ? coachData.age.replace(/\D/g, "") : 0}</span>{" "}
              <span className="text-gray-400 text-xs sm:text-sm">Years</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Birth Country</span>
            <div className="flex items-center gap-2 min-w-0">
              <CMSField
                value={coachData.birthCountry || (canEdit ? "Select Country" : "-")}
                onUpdate={(val) => handleUpdate("birthCountry", val === "Select Country" ? "" : val)}
                canEdit={canEdit}
                type="combobox"
                options={ALL_COUNTRIES}
                className="w-auto min-w-24 sm:min-w-32 justify-end"
                inputClassName="uppercase text-right w-full min-w-0 truncate text-[10px] sm:text-sm"
              />
              <FlagThumb country={coachData.birthCountry} alt="birth country flag" />
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Dual Nationality</span>
            <div className="flex items-center gap-2 min-w-0">
              <CMSField
                value={coachData.dualNationality || (canEdit ? "None" : "-")}
                onUpdate={(val) => handleUpdate("dualNationality", val === "None" ? "" : val)}
                canEdit={canEdit}
                type="combobox"
                options={ALL_COUNTRIES}
                className="w-auto min-w-24 sm:min-w-32 justify-end"
                inputClassName="uppercase text-right w-full min-w-0 truncate text-[10px] sm:text-sm"
              />
              <FlagThumb country={coachData.dualNationality} alt="dual nationality flag" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Contact
        </h2>
        <div className="flex flex-col gap-2 text-xs sm:text-sm text-primary w-full min-w-0">
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">📧</span>
            <CMSField
              value={coachData.email}
              onUpdate={() => {}}
              canEdit={false}
              className="flex-1 min-w-0 cursor-default"
              inputClassName="w-full min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">📱</span>
            <CMSField
              value={coachData.phone}
              onUpdate={(val) => handleUpdate("phone", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">📍</span>
            <CMSField
              value={coachData.location}
              onUpdate={(val) => handleUpdate("location", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">🌐</span>
            <CMSField
              value={coachData.website}
              onUpdate={(val) => handleUpdate("website", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full min-w-0 truncate text-primary hover:underline cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

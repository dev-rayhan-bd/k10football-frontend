import CMSField from "@/components/shared/CMSField";
import Image from "next/image";
import { useCoach } from "@/lib/hooks/useCoach";
import { ALL_COUNTRIES } from "./constants";
import { calculateAge, getFlagUrl } from "./utils";

export const CoachPersonalInfo = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();

  return (
    <div className="col-span-12 order-1 xl:order-0 bg-cardBg rounded-2xl md:rounded-none w-full overflow-hidden">
      {/* Personal Information */}
      <div className="p-6">
        <h2 className="text-lg text-center font-heading font-normal mb-4">
          Personal Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap shrink-0">Full Name</span>
            <CMSField
              value={coachData.fullName}
              onUpdate={(val) => handleUpdate("fullName", val)}
              canEdit={canEdit}
              className="flex-1 justify-end min-w-0 text-right"
              inputClassName="text-right w-full truncate"
            />
          </div>
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap shrink-0">Date of Birth</span>
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
              className="flex-1 justify-end min-w-0 text-right"
              inputClassName="text-right w-full bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 sm:px-3 py-1.5 rounded-lg truncate"
            />
          </div>
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap shrink-0">Age</span>
            <div className="flex items-center gap-1 justify-end flex-1 min-w-0 text-right">
              <span className="truncate">{coachData.age ? coachData.age.replace(/\D/g, "") : 0}</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap shrink-0">Birth Country</span>
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
              <CMSField
                value={coachData.birthCountry}
                onUpdate={(val) => handleUpdate("birthCountry", val)}
                canEdit={canEdit}
                type="combobox"
                options={ALL_COUNTRIES}
                className="flex-1 justify-end min-w-0 text-right"
                inputClassName="text-right w-full truncate"
              />
              <div className="relative w-6 h-4 overflow-hidden rounded-sm border border-border shrink-0">
                <Image
                  src={getFlagUrl(coachData.birthCountry)}
                  alt="birth country flag"
                  width={24}
                  height={16}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap shrink-0">Dual Nationality</span>
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
              <CMSField
                value={coachData.dualNationality}
                onUpdate={(val) => handleUpdate("dualNationality", val)}
                canEdit={canEdit}
                type="combobox"
                options={ALL_COUNTRIES}
                className="flex-1 justify-end min-w-0 text-right"
                inputClassName="text-right w-full truncate"
              />
              <div className="relative w-6 h-4 overflow-hidden rounded-sm border border-border shrink-0">
                <Image
                  src={getFlagUrl(coachData.dualNationality)}
                  alt="dual nationality flag"
                  width={24}
                  height={16}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="p-6">
        <h2 className="text-lg text-center font-heading font-normal mb-4">
          Contact
        </h2>
        <div className="space-y-2 text-sm text-primary">
          <div className="flex items-center gap-2">
            <span className="shrink-0">📧</span>
            <CMSField
              value={coachData.email}
              onUpdate={(val) => handleUpdate("email", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full truncate text-left bg-transparent border-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0">📱</span>
            <CMSField
              value={coachData.phone}
              onUpdate={(val) => handleUpdate("phone", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full truncate text-left bg-transparent border-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0">📍</span>
            <CMSField
              value={coachData.location}
              onUpdate={(val) => handleUpdate("location", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full truncate text-left bg-transparent border-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0">🌐</span>
            <CMSField
              value={coachData.website}
              onUpdate={(val) => handleUpdate("website", val)}
              canEdit={canEdit}
              className="flex-1 min-w-0"
              inputClassName="w-full truncate text-left bg-transparent border-none focus:ring-0 p-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

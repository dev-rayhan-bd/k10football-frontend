import Image from "next/image";
import CMSField from "@/components/shared/CMSField";
import trophyIcon from "@/assets/cvs/id/trofeeIcon.png";
import { useCoach } from "@/hooks/useCoach";

export const CoachCupHistory = ({
  canEdit,
  wrapperClassName = "",
}: {
  canEdit: boolean;
  wrapperClassName?: string;
}) => {
  const { coachData, handleUpdate } = useCoach();

  return (
    <div className={`p-6 ${wrapperClassName}`}>
      <h2 className="text-lg text-center font-heading font-normal mb-4">
        CUP PLAYED
      </h2>
      <div className="space-y-6 border-l-2 border-green-600 pl-4 mt-6">
        {coachData.cupHistory.map((cup: string, index: number) => {
          const parts = cup.split(" - ");
          const year = parts[0];
          const title = parts.slice(1).join(" - ");

          return (
            <div key={index} className="flex gap-4 items-center">
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                <Image
                  src={trophyIcon}
                  alt="Achievement"
                  width={36}
                  height={36}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <CMSField
                  value={year}
                  onUpdate={(val) => {
                    const newCups = [...coachData.cupHistory];
                    newCups[index] = `${val} - ${title}`;
                    handleUpdate("cupHistory", newCups);
                  }}
                  canEdit={canEdit}
                  type="textarea"
                  className="text-xs font-black text-primary/80 tracking-widest leading-relaxed uppercase"
                  inputClassName="text-xs font-black min-h-[30px] py-0.5 uppercase"
                />
                <CMSField
                  value={title}
                  onUpdate={(val) => {
                    const newCups = [...coachData.cupHistory];
                    newCups[index] = `${year} - ${val}`;
                    handleUpdate("cupHistory", newCups);
                  }}
                  canEdit={canEdit}
                  type="textarea"
                  className="text-sm md:text-base text-gray-400 leading-relaxed tracking-tight uppercase"
                  inputClassName="text-base font-black min-h-[40px] py-1 uppercase"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import CMSField from "@/components/shared/CMSField";
import { useCoach } from "@/hooks/useCoach";

export const CoachSeasonStats = ({
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
        Current Season Stats
      </h2>
      <div className="text-sm grid grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
        <div className="border border-white/10 flex flex-col items-center justify-center p-3 rounded-xl w-full min-w-0 bg-white/5">
          <CMSField
            value={coachData.seasonStats.matches}
            onUpdate={(val) => handleUpdate("seasonStats.matches", val)}
            canEdit={canEdit}
            isNumeric
            className="text-xl sm:text-2xl font-medium text-primary mb-1 justify-center min-w-0"
            inputClassName="text-center w-16 sm:w-20 bg-gray-900/50 border-gray-700 focus:border-primary transition-all rounded"
          />
          <h3 className="text-[10px] sm:text-xs uppercase text-center wrap-break-word leading-tight w-full px-1">
            Matches Coached
          </h3>
        </div>
        <div className="border border-white/10 flex flex-col items-center justify-center p-3 rounded-xl w-full min-w-0 bg-white/5">
          <CMSField
            value={coachData.seasonStats.wins}
            onUpdate={(val) => handleUpdate("seasonStats.wins", val)}
            canEdit={canEdit}
            isNumeric
            className="text-xl sm:text-2xl font-medium text-primary mb-1 justify-center min-w-0"
            inputClassName="text-center w-16 sm:w-20 bg-gray-900/50 border-gray-700 focus:border-primary transition-all rounded"
          />
          <h3 className="text-[10px] sm:text-xs uppercase text-center wrap-break-word leading-tight w-full px-1">
            Win
          </h3>
        </div>
        <div className="border border-white/10 flex flex-col items-center justify-center p-3 rounded-xl w-full min-w-0 bg-white/5">
          <CMSField
            value={Math.max(2, coachData.seasonStats.losses || 0)}
            onUpdate={(val) => handleUpdate("seasonStats.losses", Number(val))}
            canEdit={canEdit}
            isNumeric
            className="text-xl sm:text-2xl font-medium text-primary mb-1 justify-center min-w-0"
            inputClassName="text-center w-16 sm:w-20 bg-gray-900/50 border-gray-700 focus:border-primary transition-all rounded"
          />
          <h3 className="text-[10px] sm:text-xs uppercase text-center wrap-break-word leading-tight w-full px-1">
            Losses
          </h3>
        </div>
        <div className="border border-white/10 flex flex-col items-center justify-center p-3 rounded-xl w-full min-w-0 bg-white/5">
          <CMSField
            value={Math.max(2, coachData.seasonStats.draws || 0)}
            onUpdate={(val) => handleUpdate("seasonStats.draws", Number(val))}
            canEdit={canEdit}
            isNumeric
            className="text-xl sm:text-2xl font-medium text-primary mb-1 justify-center min-w-0"
            inputClassName="text-center w-16 sm:w-20 bg-gray-900/50 border-gray-700 focus:border-primary transition-all rounded"
          />
          <h3 className="text-[10px] sm:text-xs uppercase text-center wrap-break-word leading-tight w-full px-1">
            Draws
          </h3>
        </div>
      </div>
    </div>
  );
};

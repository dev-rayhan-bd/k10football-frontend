import CMSField from "@/components/shared/CMSField";
import { useCoach } from "@/hooks/useCoach";
import { formatDate } from "@/lib/utils";

const ROW_CLASS = "flex justify-between items-center gap-2 border-b pb-2 w-full min-w-0";
const FIELD_CLASS = "flex-1 min-w-0 justify-end";
const INPUT_CLASS = "uppercase text-right w-full min-w-0 truncate";

export const CoachTransferStatus = ({
  canEdit,
  wrapperClassName = "",
}: {
  canEdit: boolean;
  wrapperClassName?: string;
}) => {
  const { coachData, handleUpdate } = useCoach();

  return (
    <div className={`p-6 ${wrapperClassName}`}>
      <div className="flex justify-between items-center gap-2 mb-4">
        <h2 className="text-lg text-center font-heading font-normal">
          Transfer Status
        </h2>
        {coachData.transferStatus && (
          <span className="text-xs bg-primary text-black px-2 py-1 rounded uppercase">
            {coachData.transferStatus}
          </span>
        )}
      </div>
      {/* Values are shown in capitals, like Personal Information. */}
      <div className="flex flex-col gap-3 text-sm uppercase">
        <div className={ROW_CLASS}>
          <span className="text-gray-400 shrink-0">Football Agent Contract</span>
          <span>No</span>
        </div>
        <div className={ROW_CLASS}>
          <span className="text-gray-400 shrink-0">Contract Until</span>
          <CMSField
            value={formatDate(coachData.contractUntil)}
            onUpdate={(val) => handleUpdate("contractUntil", val)}
            canEdit={canEdit}
            className={FIELD_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>
        <div className={ROW_CLASS}>
          <span className="text-gray-400 shrink-0">Agent</span>
          <CMSField
            value={coachData.agent}
            onUpdate={(val) => handleUpdate("agent", val)}
            canEdit={canEdit}
            className={FIELD_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>
        <div className={ROW_CLASS}>
          <span className="text-gray-400 shrink-0">Agency</span>
          <CMSField
            value={coachData.agency}
            onUpdate={(val) => handleUpdate("agency", val)}
            canEdit={canEdit}
            className={FIELD_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>
        <div className={ROW_CLASS}>
          <span className="text-gray-400 shrink-0">Salary</span>
          <CMSField
            value={coachData.salary}
            onUpdate={(val) => handleUpdate("salary", val)}
            canEdit={canEdit}
            className={FIELD_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
};

import CMSField from "@/components/shared/CMSField";
import { useCoach } from "@/hooks/useCoach";

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg text-center font-heading font-normal">
          Transfer Status
        </h2>
        <span className="text-xs bg-primary text-black px-2 py-1 rounded">
          {coachData.transferStatus}
        </span>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-400">Football Agent Contract:</span>
          <span>No</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-400">Contract Until</span>
          <CMSField
            value={coachData.contractUntil}
            onUpdate={(val) => handleUpdate("contractUntil", val)}
            canEdit={canEdit}
            className="w-28 justify-end"
            inputClassName="text-right"
          />
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-400">Agent</span>
          <CMSField
            value={coachData.agent}
            onUpdate={(val) => handleUpdate("agent", val)}
            canEdit={canEdit}
            className="w-28 justify-end"
            inputClassName="text-right"
          />
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-400">Agency</span>
          <CMSField
            value={coachData.agency}
            onUpdate={(val) => handleUpdate("agency", val)}
            canEdit={canEdit}
            className="w-28 justify-end"
            inputClassName="text-right"
          />
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-400">Salary</span>
          <CMSField
            value={coachData.salary}
            onUpdate={(val) => handleUpdate("salary", val)}
            canEdit={canEdit}
            className="w-28 justify-end"
            inputClassName="text-right"
          />
        </div>
      </div>
    </div>
  );
};

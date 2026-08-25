/* eslint-disable @typescript-eslint/no-explicit-any */
import CMSField from "@/components/shared/CMSField";
import { useCoach } from "@/lib/hooks/useCoach";

export const CoachLanguages = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();

  return (
    <div className="p-6 order-1 xl:order-2">
      <h2 className="text-lg text-center font-heading font-normal mb-4">
        Languages
      </h2>
      <div className="space-y-2 text-sm">
        {coachData.languages.map((lang: any, idx: number) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b pb-2 gap-2 w-full overflow-hidden"
          >
            <CMSField
              value={lang.name}
              onUpdate={(val) => {
                const newLangs = [...coachData.languages];
                newLangs[idx] = { ...newLangs[idx], name: String(val) };
                handleUpdate("languages", newLangs);
              }}
              canEdit={canEdit}
              className="w-1/2"
            />
            <CMSField
              value={lang.level}
              onUpdate={(val) => {
                const newLangs = [...coachData.languages];
                newLangs[idx] = { ...newLangs[idx], level: String(val) };
                handleUpdate("languages", newLangs);
              }}
              canEdit={canEdit}
              type="select"
              options={["Native", "Fluent", "Intermediate", "Beginner"]}
              className="w-1/2 justify-end"
              inputClassName="text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

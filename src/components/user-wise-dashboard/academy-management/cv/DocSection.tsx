"use client";
import { Dock } from "lucide-react";
import { useState } from "react";
import { useUpdatePlayerProfileMutation } from "@/redux/features/cv/cvApi";
import CMSField from "@/components/shared/CMSField";

const DocSection = ({ editable = false }: { editable?: boolean }) => {
  const [updatePlayer] = useUpdatePlayerProfileMutation();
  const [docs, setDocs] = useState([
    { id: 1, title: "GAMES-REPORTS-16276JPG" },
    { id: 2, title: "GAMES-REPORTS-16276JPG" },
    { id: 3, title: "GAMES-REPORTS-16276JPG" },
  ]);

  const handleUpdate = async (id: number, value: string) => {
    setDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title: value } : doc)),
    );

    // try {
    //   await updatePlayer({
    //     id: "current-player",
    //     data: { [`documents.${id}.title`]: value }
    //   }).unwrap();
    // } catch (error) {
    //   console.error(error);
    // }
  };

  return (
    <div className="py-10 sm:py-20 w-full min-w-0 overflow-hidden">
      <div className="container w-full min-w-0">
        <h3 className="text-center font-heading text-wrap text-2xl sm:text-4xl mb-6 sm:mb-10">
          Docs / Certificate
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-6 sm:mt-10 w-full min-w-0">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="border p-4 sm:p-5 rounded-xl flex bg-cardBg items-center gap-3 justify-center w-full min-w-0"
            >
              <Dock className="shrink-0" />
              <CMSField
                value={doc.title}
                onUpdate={(val) => handleUpdate(doc.id, String(val))}
                canEdit={editable}
                className="text-xs sm:text-sm w-full min-w-0"
                inputClassName="truncate w-full min-w-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocSection;

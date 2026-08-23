/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CreateGameReportWizard } from "./create-game-report/index";

interface CreateGameReportProps {
  onCancel: () => void;
  onContinue: (data: any) => void;
}

const CreateGameReport = ({ onCancel, onContinue }: CreateGameReportProps) => {
  return (
    <CreateGameReportWizard 
      onCancel={onCancel} 
      onContinue={onContinue} 
    />
  );
};

export default CreateGameReport;

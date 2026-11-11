import { ReactNode } from "react";
import { MediaUploadProvider } from "@/providers/MediaUploadProvider";
import DashboardTermsGuard from "@/components/dashboard/DashboardTermsGuard";

const DashboardRootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MediaUploadProvider>
      <DashboardTermsGuard />
      {children}
    </MediaUploadProvider>
  );
};
export default DashboardRootLayout;

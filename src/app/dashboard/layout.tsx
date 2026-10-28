import { ReactNode } from "react";
import { MediaUploadProvider } from "@/providers/MediaUploadProvider";

const DashboardRootLayout = ({ children }: { children: ReactNode }) => {
  return <MediaUploadProvider>{children}</MediaUploadProvider>;
};
export default DashboardRootLayout;

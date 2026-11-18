import { ReactNode } from "react";
import { MediaUploadProvider } from "@/providers/MediaUploadProvider";
import DashboardTermsGuard from "@/components/dashboard/DashboardTermsGuard";
import ChatSocketProvider from "@/components/chat/ChatSocketProvider";

const DashboardRootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MediaUploadProvider>
      <DashboardTermsGuard />
      <ChatSocketProvider />
      {children}
    </MediaUploadProvider>
  );
};
export default DashboardRootLayout;

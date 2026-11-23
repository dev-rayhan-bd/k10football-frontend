import { ReactNode } from "react";
import DashboardTermsGuard from "@/components/dashboard/DashboardTermsGuard";
import ChatSocketProvider from "@/components/chat/ChatSocketProvider";

const DashboardRootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <DashboardTermsGuard />
      <ChatSocketProvider />
      {children}
    </>
  );
};
export default DashboardRootLayout;

import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4 animate-in fade-in zoom-in duration-500 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

import { ReactNode } from "react";
import { NavigationSidebar } from "@/components/navigation/NavigationSidebar";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => (
  <div className="fh-full">
    <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
      <NavigationSidebar />
    </div>
    <main className="md:pl-[72px] h-full">{children}</main>
  </div>
);

export default MainLayout;

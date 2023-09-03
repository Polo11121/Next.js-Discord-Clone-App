import { ReactNode } from "react";
import { ServerSidebar } from "@/components/server/ServerSidebar";

type ServerLayoutProps = {
  children: ReactNode;
  params: {
    serverId: string;
  };
};

const ServerLayout = async ({
  children,
  params: { serverId },
}: ServerLayoutProps) => (
  <div className="h-full">
    <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
      <ServerSidebar serverId={serverId} />
    </div>
    <main className="h-full md:pl-60">{children}</main>
  </div>
);

export default ServerLayout;

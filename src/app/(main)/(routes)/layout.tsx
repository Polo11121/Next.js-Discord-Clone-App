import { ReactNode } from "react";
import { NavigationSidebar } from "@/components/navigation/NavigationSidebar";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = async ({ children }: MainLayoutProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">{children}</main>
    </div>
  );
};

export default MainLayout;

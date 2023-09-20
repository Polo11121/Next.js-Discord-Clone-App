import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "@/components/navigation/NavigationAction";
import { Separator } from "@/components/ui/Separator";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { NavigationItem } from "@/components/navigation/NavigationItem";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { UserButton } from "@clerk/nextjs";

export const NavigationSidebar = async () => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map(({ id, imageUrl, name }) => (
          <NavigationItem id={id} name={name} imageUrl={imageUrl} key={id} />
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <DarkModeToggle />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-[48px] h-[48px]",
            },
          }}
        />
      </div>
    </div>
  );
};

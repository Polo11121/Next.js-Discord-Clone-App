import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type ServerPageProps = {
  params: {
    serverId: string;
  };
};

const ServerPage = async ({ params: { serverId } }: ServerPageProps) => {
  const profile = await currentProfile();

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }

  return redirect(`/servers/${serverId}/channels/${initialChannel?.id}`);
};

export default ServerPage;

import { auth } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextApiRequest } from "next";

export const currentProfile = async (req?: NextApiRequest) => {
  const { userId } = req ? getAuth(req) : auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
};

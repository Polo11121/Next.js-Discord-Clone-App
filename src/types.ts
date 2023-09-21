import { Server as NetServer, Socket } from "net";
import { Server as SocketIOServer } from "socket.io";
import { Member, Message, Profile, Server } from "@prisma/client";
import { NextApiResponse } from "next";

export type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & {
    profile: Profile;
  })[];
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

import { HydrationProvider } from "@/components/providers/HydrationProvider";
import {
  MembersModal,
  CreateChannelModal,
  CreateServerModal,
  EditServerModal,
  InitialModal,
  InviteUserModal,
} from "@/components/modals";

export const ModalsProvider = () => (
  <HydrationProvider>
    <InviteUserModal />
    <CreateServerModal />
    <EditServerModal />
    <MembersModal />
    <CreateChannelModal />
  </HydrationProvider>
);

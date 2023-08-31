import { CreateServerModal } from "@/components/modals/CreateServerModal";
import { InviteUserModal } from "@/components/modals/InviteUserModal";
import { HydrationProvider } from "@/components/providers/HydrationProvider";
import { EditServerModal } from "@/components//modals/EditServerModal";
import { MembersModal } from "@/components/modals/MembersModal";

export const ModalsProvider = () => (
  <HydrationProvider>
    <InviteUserModal />
    <CreateServerModal />
    <EditServerModal />
    <MembersModal />
  </HydrationProvider>
);

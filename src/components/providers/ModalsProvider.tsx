import { CreateServerModal } from "@/components/modals/CreateServerModal";
import { InviteUserModal } from "@/components/modals/InviteUserModal";
import { HydrationProvider } from "@/components/providers/HydrationProvider";

export const ModalsProvider = () => (
  <HydrationProvider>
    <InviteUserModal />
    <CreateServerModal />
  </HydrationProvider>
);

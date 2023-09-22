import { HydrationProvider } from "@/components/providers/HydrationProvider";
import {
  MembersModal,
  CreateChannelModal,
  CreateServerModal,
  EditServerModal,
  InviteUserModal,
  LeaveServerModal,
  DeleteServerModal,
  DeleteChannelModal,
  EditChannelModal,
  MessageFileModal,
  DeleteMessageModal,
} from "@/components/modals";

export const ModalsProvider = () => (
  <HydrationProvider>
    <InviteUserModal />
    <CreateServerModal />
    <EditServerModal />
    <MembersModal />
    <LeaveServerModal />
    <CreateChannelModal />
    <DeleteServerModal />
    <DeleteChannelModal />
    <EditChannelModal />
    <MessageFileModal />
    <DeleteMessageModal />
  </HydrationProvider>
);

"use client ";

import { CreateServerModal } from "@/components/modals/CreateServerModal";
import { HydrationProvider } from "@/components/providers/HydrationProvider";

export const ModalsProvider = () => (
  <HydrationProvider>
    <CreateServerModal />
  </HydrationProvider>
);

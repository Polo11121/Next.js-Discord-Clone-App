"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { useModal } from "@/hooks/useModalStore";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export const DeleteServerModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onClose, type, server } = useModal((state) => ({
    isOpen: state.isOpen,
    onOpen: state.onOpen,
    onClose: state.onClose,
    type: state.type,
    server: state.data.server,
  }));
  const router = useRouter();

  const isModalOpen = isOpen && type === "deleteServer";

  const deleteServerHandler = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/api/servers/${server?.id}`);

      onClose();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete server{" "}
            <span className="font-semibold text-indigo-500">
              {server?.name}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={deleteServerHandler}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

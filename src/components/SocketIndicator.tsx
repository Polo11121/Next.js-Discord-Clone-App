"use client";

import { useSocket } from "@/components/providers/SocketProvider";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-white",
        isConnected ? "bg-green-600" : "bg-yellow-600"
      )}
    >
      {isConnected ? "Live: Real-time updates" : "Fallback: Polling every 1s"}
    </Badge>
  );
};

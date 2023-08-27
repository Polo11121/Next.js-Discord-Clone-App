"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

type ActionTooltipProps = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
};

export const ActionTooltip = ({
  label,
  children,
  side = "bottom",
  align = "center",
}: ActionTooltipProps) => (
  <TooltipProvider>
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <p className="font-semibold text-sm capitalize">
          {label.toLowerCase()}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Smile } from "lucide-react";
import { useTheme } from "next-themes";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

type EmojiPickerProps = {
  onChange: (value: string) => void;
};

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { resolvedTheme } = useTheme();

  const pickEmojiHandler = (emoji: any) => onChange(emoji.native);

  return (
    <Popover>
      <PopoverTrigger>
        <Smile className="text-zinc=500 dark:dark-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          theme={resolvedTheme}
          data={data}
          onEmojiSelect={pickEmojiHandler}
        />
      </PopoverContent>
    </Popover>
  );
};

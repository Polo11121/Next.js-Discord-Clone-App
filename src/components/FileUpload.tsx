"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import "@uploadthing/react/styles.css";

type FileUploadProps = {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "serverImage" | "messageFile";
  disabled?: boolean;
};

export const FileUpload = ({
  value,
  onChange,
  endpoint,
  disabled = false,
}: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  const deleteHandler = () => onChange("");

  return value && fileType !== "pdf" ? (
    <div className="relative h-20 w-20">
      <Image fill src={value} alt="Upload" className="rounded-full" />
      <button
        disabled={disabled}
        onClick={deleteHandler}
        className="bg-rose-500 text-white p-1 rounded absolute top-0 right-0 shadow-sm"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ) : (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => onChange(res?.[0].url)}
      onUploadError={(err: Error) => console.log(err)}
    />
  );
};

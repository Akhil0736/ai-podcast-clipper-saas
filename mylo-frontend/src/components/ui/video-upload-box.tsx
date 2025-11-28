"use client";

import { Button } from "~/components/ui/button";
import { Upload, ArrowUp, X, Film } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface VideoUploadBoxProps {
  /** If true, redirects to signup on any interaction (for landing page) */
  redirectToAuth?: boolean;
}

export function VideoUploadBox({ redirectToAuth = true }: VideoUploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const redirectToSignup = () => {
    router.push("/signup");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (redirectToAuth) {
      redirectToSignup();
      return;
    }
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (redirectToAuth) {
      redirectToSignup();
      return;
    }
    
    if (event.dataTransfer.files?.[0]) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (redirectToAuth) {
      redirectToSignup();
      return;
    }
    uploadInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md">
      <div
        onClick={!file ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed bg-white p-6 transition-all ${
          isDragging
            ? "border-[#ffc247] bg-[#fffdd9]"
            : file
              ? "border-[#ffc247] bg-[#fffdd9]"
              : "border-gray-300 hover:border-[#ffc247] hover:bg-[#fffdd9]"
        } ${!file ? "cursor-pointer" : ""}`}
      >
        <input
          ref={uploadInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc247] to-[#00ffe5]">
              <Film className="h-6 w-6 text-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc247] to-[#00ffe5]">
              <Upload className="h-7 w-7 text-gray-900" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Drop your video here</p>
              <p className="text-sm text-gray-500">
                or click to browse • MP4, MOV, AVI up to 500MB
              </p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <Button
          className="mt-4 w-full rounded-lg bg-[#ffc247] py-6 text-lg font-semibold text-gray-900 hover:bg-[#ffb020] transition-colors"
          onClick={() => {
            window.location.href = "/signup";
          }}
        >
          Create Viral Clips
          <ArrowUp className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

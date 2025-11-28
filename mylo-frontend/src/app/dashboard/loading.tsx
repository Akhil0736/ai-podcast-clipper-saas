import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-12">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] blur-lg opacity-30 animate-pulse" />
        <Loader2 className="relative h-10 w-10 animate-spin text-[#ffc247]" />
      </div>
      <span className="text-lg text-gray-600">Loading dashboard...</span>
    </div>
  );
}

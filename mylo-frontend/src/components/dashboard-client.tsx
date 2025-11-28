"use client";

import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Loader2, UploadCloud, Sparkles, Wand2, Film, Scissors } from "lucide-react";
import { useEffect } from "react";

// Processing steps for animation
const PROCESSING_STEPS = [
  { icon: Film, label: "Analyzing video content...", duration: 3000 },
  { icon: Wand2, label: "AI detecting key moments...", duration: 4000 },
  { icon: Scissors, label: "Generating viral clips...", duration: 3000 },
  { icon: Sparkles, label: "Polishing your clips...", duration: 2000 },
];

// Processing animation component
function ProcessingAnimation({ filename }: { filename: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = PROCESSING_STEPS[currentStep]?.icon ?? Film;
  const currentLabel = PROCESSING_STEPS[currentStep]?.label ?? "Processing...";

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#ffc247]/30 bg-gradient-to-br from-[#ffc247]/5 via-white to-[#00ffe5]/5 p-6">
      {/* Animated background shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#ffc247]/10 to-transparent" />
      
      <div className="relative flex items-center gap-4">
        {/* Animated icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] opacity-20" />
          <div className="relative rounded-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] p-3">
            <CurrentIcon className="h-6 w-6 text-gray-900 animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{filename}</p>
          <p className="text-sm text-gray-600 animate-pulse">{currentLabel}</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {PROCESSING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "bg-gradient-to-r from-[#ffc247] to-[#00ffe5] scale-125"
                  : idx < currentStep
                  ? "bg-[#00ffe5]"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] transition-all duration-1000 ease-out animate-[progress_12s_linear_infinite]"
          style={{ width: `${((currentStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
        />
      </div>
      
      <p className="mt-2 text-xs text-gray-500 text-center">
        This usually takes 2-5 minutes depending on video length
      </p>
    </div>
  );
}

// YouTube icon component (avoiding deprecated lucide Youtube)
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
import { useState } from "react";
import { generateUploadSignature, markFileAsUploaded, processYoutubeUrl } from "~/actions/upload";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { ClipDisplay } from "./clip-display";

// YouTube URL validation
function isValidYoutubeUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

// Format date consistently to avoid hydration mismatch
function formatDate(date: Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

export function DashboardClient({
  uploadedFiles,
  clips,
}: {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    clipsCount: number;
    createdAt: Date;
  }[];
  clips: Clip[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [processingYoutube, setProcessingYoutube] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "youtube">("file");
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return;
    
    if (!isValidYoutubeUrl(youtubeUrl)) {
      toast.error("Invalid YouTube URL", {
        description: "Please enter a valid YouTube video URL",
      });
      return;
    }

    setProcessingYoutube(true);

    try {
      const result = await processYoutubeUrl(youtubeUrl);
      
      if (!result.success) {
        throw new Error(result.error ?? "Failed to process YouTube video");
      }

      setYoutubeUrl("");
      router.refresh();

      toast.success("YouTube video submitted", {
        description: "Your video is being downloaded and processed. Check the status below.",
        duration: 5000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process YouTube video. Please try again.";
      toast.error("Processing failed", {
        description: errorMessage,
      });
    } finally {
      setProcessingYoutube(false);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0]!;
    setUploading(true);

    try {
      // Get upload signature from server
      const { success, signature, timestamp, cloudName, apiKey, folder, publicId, uploadedFileId } = 
        await generateUploadSignature({
          filename: file.name,
          contentType: file.type,
        });

      if (!success) throw new Error("Failed to get upload signature");

      // Create form data for Cloudinary upload
      // Note: resource_type is in the URL path, not form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      formData.append('public_id', publicId);

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json() as { public_id: string };

      // Update database with Cloudinary public_id
      await markFileAsUploaded(uploadedFileId, result.public_id);
      
      // Trigger video processing
      await processVideo(uploadedFileId);

      setFiles([]);

      toast.success("Video uploaded successfully", {
        description:
          "Your video has been scheduled for processing. Check the status below.",
        duration: 5000,
      });
    } catch {
      toast.error("Upload failed", {
        description:
          "There was a problem uploading your video. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Video{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Clipper
            </span>
          </h1>
          <p className="text-gray-600">
            Upload your video and get AI-generated clips instantly
          </p>
        </div>
        <Link href="/dashboard/billing">
          <Button className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900 hover:opacity-90 border-0 font-semibold">
            Buy Credits
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="bg-gray-100">
          <TabsTrigger 
            value="upload" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ffc247] data-[state=active]:to-[#00ffe5] data-[state=active]:text-gray-900"
          >
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="my-clips"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ffc247] data-[state=active]:to-[#00ffe5] data-[state=active]:text-gray-900"
          >
            My Clips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Upload a video file or paste a YouTube URL to generate clips
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Upload Mode Tabs */}
              <div className="mb-6">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                  <button
                    onClick={() => setUploadMode("file")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      uploadMode === "file"
                        ? "bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload File
                  </button>
                  <button
                    onClick={() => setUploadMode("youtube")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      uploadMode === "youtube"
                        ? "bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <YoutubeIcon className="h-4 w-4" />
                    YouTube URL
                  </button>
                </div>
              </div>

              {/* File Upload Mode */}
              {uploadMode === "file" && (
                <>
              <Dropzone
                onDrop={handleDrop}
                accept={{ "video/mp4": [".mp4"] }}
                maxSize={500 * 1024 * 1024}
                disabled={uploading}
                maxFiles={1}
              >
                {(_dropzone: DropzoneState) => (
                  <>
                    <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-[#ffc247]/40 bg-gradient-to-br from-[#ffc247]/5 to-[#00ffe5]/5 p-10 text-center transition-colors hover:border-[#ffc247]/60 hover:bg-gradient-to-br hover:from-[#ffc247]/10 hover:to-[#00ffe5]/10">
                      <div className="rounded-full bg-gradient-to-br from-[#ffc247]/20 to-[#00ffe5]/20 p-4">
                        <UploadCloud className="h-10 w-10 text-[#ffc247]" />
                      </div>
                      <p className="font-medium text-gray-900">Drag and drop your file</p>
                      <p className="text-gray-500 text-sm">
                        or click to browse (MP4 up to 500MB)
                      </p>
                      <Button
                        className="cursor-pointer bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900 hover:opacity-90 border-0 font-semibold"
                        size="sm"
                        disabled={uploading}
                      >
                        Select File
                      </Button>
                    </div>
                  </>
                )}
              </Dropzone>

              <div className="mt-2 flex items-start justify-between">
                <div>
                  {files.length > 0 && (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Selected file:</p>
                      {files.map((file) => (
                        <p key={file.name} className="text-muted-foreground">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  disabled={files.length === 0 || uploading}
                  onClick={handleUpload}
                  className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900 hover:opacity-90 border-0 font-semibold disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload and Generate Clips"
                  )}
                </Button>
              </div>
                </>
              )}

              {/* YouTube URL Mode */}
              {uploadMode === "youtube" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-[#ffc247]/40 bg-gradient-to-br from-[#ffc247]/5 to-[#00ffe5]/5 p-10 text-center transition-colors hover:border-[#ffc247]/60 hover:bg-gradient-to-br hover:from-[#ffc247]/10 hover:to-[#00ffe5]/10">
                    <div className="rounded-full bg-gradient-to-br from-[#ffc247]/20 to-[#00ffe5]/20 p-4">
                      <YoutubeIcon className="h-10 w-10 text-[#ff0000]" />
                    </div>
                    <p className="font-medium text-gray-900">Paste a YouTube URL</p>
                    <p className="text-gray-500 text-sm">
                      Supports youtube.com, youtu.be, and YouTube Shorts (max 60 min)
                    </p>
                    <div className="w-full max-w-md space-y-3">
                      <Input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={processingYoutube}
                        className="text-center"
                      />
                      <Button
                        onClick={handleYoutubeSubmit}
                        disabled={!youtubeUrl.trim() || processingYoutube}
                        className="w-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900 hover:opacity-90 border-0 font-semibold disabled:opacity-50"
                      >
                        {processingYoutube ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Generate Clips from YouTube"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="pt-6 space-y-4">
                  {/* Show processing animation for items being processed */}
                  {uploadedFiles.filter(f => f.status === "processing" || f.status === "queued").map((item) => (
                    <ProcessingAnimation key={item.id} filename={item.filename} />
                  ))}
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium">Queue status</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  <div className="max-h-[300px] overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Clips created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-xs truncate font-medium">
                              {item.filename}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(item.createdAt)}
                            </TableCell>
                            <TableCell>
                              {item.status === "queued" && (
                                <Badge variant="outline" className="border-[#ffc247]/50 text-[#ffc247] bg-[#ffc247]/10">
                                  Queued
                                </Badge>
                              )}
                              {item.status === "processing" && (
                                <Badge variant="outline" className="border-[#00ffe5]/50 text-[#00c4b4] bg-[#00ffe5]/10">
                                  Processing
                                </Badge>
                              )}
                              {item.status === "processed" && (
                                <Badge className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-gray-900 border-0">
                                  Processed
                                </Badge>
                              )}
                              {item.status === "no credits" && (
                                <Badge variant="destructive">No credits</Badge>
                              )}
                              {item.status === "failed" && (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.clipsCount > 0 ? (
                                <span>
                                  {item.clipsCount} clip
                                  {item.clipsCount !== 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  No clips yet
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-clips">
          <Card>
            <CardHeader>
              <CardTitle>My Clips</CardTitle>
              <CardDescription>
                View and manage your generated clips here. Processing may take a
                few minuntes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClipDisplay clips={clips} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

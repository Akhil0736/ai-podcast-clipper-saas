"use client";

import type { Clip } from "@prisma/client";
import { Download, Loader2, Play, Copy, Check, Hash, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { getClipPlayUrl } from "~/actions/generation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { TranscriptEditor } from "./transcript-editor";

// Extended Clip type with AI-generated fields
type ClipWithAI = Clip & {
  titles?: string | null;
  caption?: string | null;
  hashtags?: string | null;
  transcript?: string | null;
  transcriptSegments?: string | null;
};

function ClipCard({ clip, onClipUpdated }: { clip: ClipWithAI; onClipUpdated?: () => void }) {
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  const [copiedTitle, setCopiedTitle] = useState<number | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Parse JSON fields safely
  const titles: string[] = clip.titles ? (JSON.parse(clip.titles) as string[]) : [];
  const hashtags: string[] = clip.hashtags ? (JSON.parse(clip.hashtags) as string[]) : [];
  const transcriptSegments: Array<{word: string; start: number; end: number}> = 
    clip.transcriptSegments ? (JSON.parse(clip.transcriptSegments) as Array<{word: string; start: number; end: number}>) : [];

  useEffect(() => {
    async function fetchPlayUrl() {
      try {
        const result = await getClipPlayUrl(clip.id);
        if (result.succes && result.url) {
          setPlayUrl(result.url);
        } else if (result.error) {
          console.error("Failed to get play url: " + result.error);
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoadingUrl(false);
      }
    }

    void fetchPlayUrl();
  }, [clip.id]);

  const handleDownload = () => {
    if (playUrl) {
      const link = document.createElement("a");
      link.href = playUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = async (text: string, type: "title" | "caption", index?: number) => {
    await navigator.clipboard.writeText(text);
    if (type === "title" && index !== undefined) {
      setCopiedTitle(index);
      setTimeout(() => setCopiedTitle(null), 2000);
    } else {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const copyAllContent = async () => {
    const content = `${clip.caption ?? ""}\n\n${hashtags.join(" ")}`;
    await navigator.clipboard.writeText(content);
    toast.success("Caption and hashtags copied!");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Video Player */}
      <div className="aspect-[9/16] w-full overflow-hidden rounded-lg bg-gray-100">
        {isLoadingUrl ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : playUrl ? (
          <video
            src={playUrl}
            controls
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="text-muted-foreground h-10 w-10 opacity-50" />
          </div>
        )}
      </div>

      {/* AI Generated Titles */}
      {titles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hook Titles</p>
          <div className="space-y-1.5">
            {titles.map((title, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <p className="flex-1 text-sm text-gray-700 line-clamp-2">{title}</p>
                <button
                  onClick={() => copyToClipboard(title, "title", idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  {copiedTitle === idx ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Generated Caption */}
      {clip.caption && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Caption</p>
            <button
              onClick={() => copyToClipboard(clip.caption ?? "", "caption")}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {copiedCaption ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-700">{clip.caption}</p>
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hashtags</p>
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#ffc247]/10 to-[#00ffe5]/10 text-gray-700 border border-[#ffc247]/20"
              >
                <Hash className="h-3 w-3" />
                {tag.replace("#", "")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Text-Based Editor */}
      {showEditor && transcriptSegments.length > 0 && (
        <TranscriptEditor
          segments={transcriptSegments.map(s => ({ ...s, keep: true }))}
          clipId={clip.id}
          cloudinaryPublicId={clip.s3Key}
          onSave={() => {
            setShowEditor(false);
            onClipUpdated?.();
            toast.success("Clip edited! Refresh to see the new version.");
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
          <Download className="mr-1.5 h-4 w-4" />
          Download
        </Button>
        {transcriptSegments.length > 0 && !showEditor && (
          <Button 
            onClick={() => setShowEditor(true)} 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Scissors className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
        )}
        {(clip.caption ?? hashtags.length > 0) && (
          <Button onClick={copyAllContent} variant="outline" size="sm" className="flex-1">
            <Copy className="mr-1.5 h-4 w-4" />
            Copy All
          </Button>
        )}
      </div>
    </div>
  );
}

export function ClipDisplay({ clips, onRefresh }: { clips: ClipWithAI[]; onRefresh?: () => void }) {
  if (clips.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center">
        No clips generated yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} onClipUpdated={onRefresh} />
      ))}
    </div>
  );
}

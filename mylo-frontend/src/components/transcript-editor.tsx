"use client";

import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Scissors, Undo2, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface TranscriptSegment {
  word: string;
  start: number;
  end: number;
  keep: boolean;
}

interface TranscriptEditorProps {
  segments: TranscriptSegment[];
  clipId: string;
  cloudinaryPublicId: string;
  onSave: (newClipData: {
    cloudinary_public_id: string;
    cloudinary_url: string;
    transcript: string;
    titles: string[];
    caption: string;
    hashtags: string[];
  }) => void;
  onCancel: () => void;
}

export function TranscriptEditor({
  segments: initialSegments,
  clipId,
  cloudinaryPublicId,
  onSave,
  onCancel,
}: TranscriptEditorProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>(
    initialSegments.map((s) => ({ ...s, keep: true }))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  const _toggleSegment = useCallback((index: number) => {
    setSegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, keep: !seg.keep } : seg))
    );
  }, []);

  const handleMouseDown = useCallback((index: number) => {
    setSelectionStart(index);
  }, []);

  const handleMouseUp = useCallback(
    (endIndex: number) => {
      if (selectionStart !== null) {
        const start = Math.min(selectionStart, endIndex);
        const end = Math.max(selectionStart, endIndex);

        setSegments((prev) =>
          prev.map((seg, i) => {
            if (i >= start && i <= end) {
              return { ...seg, keep: !seg.keep };
            }
            return seg;
          })
        );
      }
      setSelectionStart(null);
    },
    [selectionStart]
  );

  const resetAll = useCallback(() => {
    setSegments(initialSegments.map((s) => ({ ...s, keep: true })));
  }, [initialSegments]);

  const hasChanges = segments.some((seg) => seg.keep !== true);
  const keptCount = segments.filter((s) => s.keep).length;
  const removedCount = segments.length - keptCount;

  const handleApplyEdits = async () => {
    if (!hasChanges) {
      toast.error("No changes to apply");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/edit-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId,
          cloudinaryPublicId,
          segments: segments.map((s) => ({
            word: s.word,
            start: s.start,
            end: s.end,
            keep: s.keep,
          })),
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Failed to apply edits");
      }

      const result = (await response.json()) as {
        cloudinary_public_id: string;
        cloudinary_url: string;
        transcript: string;
        titles: string[];
        caption: string;
        hashtags: string[];
      };
      toast.success("Clip edited successfully!");
      onSave(result);
    } catch (error) {
      console.error("Error applying edits:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to apply edits"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Text-Based Editing
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-green-600">{keptCount} kept</span>
          <span>•</span>
          <span className="text-red-500">{removedCount} removed</span>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Click words to remove them. Click and drag to select multiple words.
        Removed words will be cut from the video.
      </p>

      {/* Transcript with clickable words */}
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-3 max-h-48 overflow-y-auto select-none"
        onMouseLeave={() => setSelectionStart(null)}
      >
        <div className="flex flex-wrap gap-1">
          {segments.map((segment, index) => (
            <span
              key={index}
              onMouseDown={() => handleMouseDown(index)}
              onMouseUp={() => handleMouseUp(index)}
              className={`
                px-1.5 py-0.5 rounded cursor-pointer transition-all text-sm
                ${
                  segment.keep
                    ? "bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50"
                    : "bg-red-100 border border-red-300 text-red-500 line-through hover:border-green-300 hover:bg-green-50"
                }
                ${selectionStart !== null ? "select-none" : ""}
              `}
            >
              {segment.word}
            </span>
          ))}
        </div>
      </div>

      {/* Preview of what will be kept */}
      {hasChanges && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700 mb-1">
            Preview (what will remain):
          </p>
          <p className="text-sm text-green-800">
            {segments
              .filter((s) => s.keep)
              .map((s) => s.word)
              .join(" ")}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={resetAll}
          variant="outline"
          size="sm"
          disabled={!hasChanges || isProcessing}
          className="flex-1"
        >
          <Undo2 className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          disabled={isProcessing}
          className="flex-1"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button
          onClick={handleApplyEdits}
          size="sm"
          disabled={!hasChanges || isProcessing}
          className="flex-1 bg-gradient-to-r from-[#ffc247] to-[#00ffe5] text-black hover:opacity-90"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Apply Edits
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

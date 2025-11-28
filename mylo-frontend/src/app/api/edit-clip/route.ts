import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { env } from "~/env";

interface EditClipRequest {
  clipId: string;
  cloudinaryPublicId: string;
  segments: Array<{
    word: string;
    start: number;
    end: number;
    keep: boolean;
  }>;
  captionStyle?: string;
  transitionStyle?: string;
}

interface BackendResponse {
  cloudinary_public_id: string;
  cloudinary_url: string;
  transcript: string;
  titles: string[];
  caption: string;
  hashtags: string[];
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as EditClipRequest;
    const { clipId, cloudinaryPublicId, segments, captionStyle = "default", transitionStyle = "fade" } = body;

    // Verify the clip belongs to the user
    const clip = await db.clip.findFirst({
      where: {
        id: clipId,
        userId: session.user.id,
      },
    });

    if (!clip) {
      return NextResponse.json({ message: "Clip not found" }, { status: 404 });
    }

    // Check user has credits
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        { message: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Call backend to edit the clip
    // The edit endpoint is derived from the process video endpoint
    const processEndpoint = String(env.PROCESS_VIDEO_ENDPOINT);
    const editEndpoint = env.EDIT_CLIP_ENDPOINT 
      ? String(env.EDIT_CLIP_ENDPOINT)
      : processEndpoint.replace('/process_video', '/edit_clip');
    
    const response = await fetch(editEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
      },
      body: JSON.stringify({
        cloudinary_public_id: cloudinaryPublicId,
        segments,
        caption_style: captionStyle,
        transition_style: transitionStyle,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Backend error:", error);
      return NextResponse.json(
        { message: "Failed to process edit" },
        { status: 500 }
      );
    }

    const result = (await response.json()) as BackendResponse;

    // Create new clip record for the edited version
    // Using minimal required fields first
    const newClipId = crypto.randomUUID().replace(/-/g, '').slice(0, 25);
    
    await db.$executeRaw`
      INSERT INTO Clip (id, s3Key, uploadedFileId, userId, transcript, caption, titles, hashtags, transcriptSegments, createdAt, updatedAt)
      VALUES (
        ${newClipId},
        ${result.cloudinary_public_id},
        ${clip.uploadedFileId},
        ${session.user.id},
        ${result.transcript},
        ${result.caption},
        ${JSON.stringify(result.titles)},
        ${JSON.stringify(result.hashtags)},
        ${JSON.stringify(segments.filter((s) => s.keep))},
        datetime('now'),
        datetime('now')
      )
    `;
    
    const newClip = { id: newClipId };

    // Deduct 1 credit for editing
    await db.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json({
      ...result,
      clipId: newClip.id,
    });
  } catch (error) {
    console.error("Error editing clip:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

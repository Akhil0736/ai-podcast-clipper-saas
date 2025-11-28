"use server";

import { v2 as cloudinary } from 'cloudinary';
import { env } from "~/env";
import { auth } from "~/server/auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "~/server/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function generateUploadSignature(fileInfo: {
  filename: string;
  contentType: string;
}): Promise<{
  success: boolean;
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
  uploadedFileId: string;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const uniqueId = uuidv4();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "mylo-videos";
  const publicId = `${uniqueId}/original`;
  
  // Generate signature for secure upload
  // Note: resource_type is NOT included in signature - it's passed in the URL path
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folder,
      public_id: publicId,
    },
    env.CLOUDINARY_API_SECRET
  );

  // Create database record
  const uploadedFileDbRecord = await db.uploadedFile.create({
    data: {
      userId: session.user.id,
      s3Key: publicId, // Store Cloudinary public_id (keeping field name for compatibility)
      displayName: fileInfo.filename,
      uploaded: false,
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    signature,
    timestamp,
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
    publicId,
    uploadedFileId: uploadedFileDbRecord.id,
  };
}

export async function markFileAsUploaded(uploadedFileId: string, publicId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.uploadedFile.update({
    where: {
      id: uploadedFileId,
      userId: session.user.id,
    },
    data: {
      uploaded: true,
      s3Key: publicId, // Store Cloudinary public_id
    },
  });
}

export async function getCloudinaryUrl(
  publicId: string, 
  options: { quality?: string; fetch_format?: string } = {}
) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    quality: options.quality,
    fetch_format: options.fetch_format,
  });
}

export async function getCloudinaryDownloadUrl(publicId: string) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    flags: "attachment"
  });
}


export async function processYoutubeUrl(youtubeUrl: string): Promise<{
  success: boolean;
  uploadedFileId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Extract video title from URL for display name
  const videoId = extractYoutubeVideoId(youtubeUrl);
  const displayName = `YouTube Video (${videoId ?? 'unknown'})`;

  // Create database record
  const uploadedFileDbRecord = await db.uploadedFile.create({
    data: {
      userId: session.user.id,
      s3Key: `youtube/${videoId ?? uuidv4()}`,
      displayName: displayName,
      uploaded: true, // Mark as uploaded since we'll process directly
      status: "queued",
    },
    select: {
      id: true,
    },
  });

  // Call Modal backend with YouTube URL
  try {
    const response = await fetch(env.PROCESS_VIDEO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
      },
      body: JSON.stringify({
        youtube_url: youtubeUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    // Update status to processing
    await db.uploadedFile.update({
      where: { id: uploadedFileDbRecord.id },
      data: { status: "processing" },
    });

    return {
      success: true,
      uploadedFileId: uploadedFileDbRecord.id,
    };
  } catch (error) {
    // Update status to failed
    await db.uploadedFile.update({
      where: { id: uploadedFileDbRecord.id },
      data: { status: "failed" },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}


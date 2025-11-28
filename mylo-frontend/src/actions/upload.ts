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
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folder,
      public_id: publicId,
      resource_type: "video",
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

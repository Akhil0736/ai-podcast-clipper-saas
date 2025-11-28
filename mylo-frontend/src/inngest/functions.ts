import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    retries: 1,
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
  },
  { event: "process-video-events" },
  async ({ event, step }) => {
    const { uploadedFileId } = event.data as {
      uploadedFileId: string;
      userId: string;
    };

    try {
      const { userId, credits, s3Key } = await step.run(
        "check-credits",
        async () => {
          const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
            where: {
              id: uploadedFileId,
            },
            select: {
              user: {
                select: {
                  id: true,
                  credits: true,
                },
              },
              s3Key: true,
            },
          });

          return {
            userId: uploadedFile.user.id,
            credits: uploadedFile.user.credits,
            s3Key: uploadedFile.s3Key,
          };
        },
      );

      if (credits > 0) {
        await step.run("set-status-processing", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processing",
            },
          });
        });

        await step.fetch(env.PROCESS_VIDEO_ENDPOINT, {
          method: "POST",
          body: JSON.stringify({ s3_key: s3Key }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
          },
        });

        const { clipsFound } = await step.run(
          "create-clips-in-db",
          async () => {
            // List all videos in the mylo-videos folder with the prefix
            const folderPrefix = s3Key.split("/")[0]!;
            
            const allPublicIds = await listCloudinaryVideosByPrefix(folderPrefix);

            const clipPublicIds = allPublicIds.filter(
              (publicId) => !publicId.endsWith("original")
            );

            if (clipPublicIds.length > 0) {
              await db.clip.createMany({
                data: clipPublicIds.map((clipPublicId) => ({
                  s3Key: clipPublicId, // Store Cloudinary public_id (keeping field name for compatibility)
                  uploadedFileId,
                  userId,
                })),
              });
            }

            return { clipsFound: clipPublicIds.length };
          },
        );

        await step.run("deduct-credits", async () => {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              credits: {
                decrement: Math.min(credits, clipsFound),
              },
            },
          });
        });

        await step.run("set-status-processed", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processed",
            },
          });
        });
      } else {
        await step.run("set-status-no-credits", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "no credits",
            },
          });
        });
      }
    } catch (_error: unknown) {
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "failed",
        },
      });
    }
  },
);

async function listCloudinaryVideosByPrefix(prefix: string): Promise<string[]> {
  try {
    // Search for videos in the mylo-videos folder with the given prefix
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'video',
      prefix: `mylo-videos/${prefix}`,
      max_results: 500,
    }) as { resources?: Array<{ public_id: string }> };

    return result.resources?.map((resource) => resource.public_id).filter(Boolean) ?? [];
  } catch (error) {
    console.error('Error listing Cloudinary videos:', error);
    return [];
  }
}

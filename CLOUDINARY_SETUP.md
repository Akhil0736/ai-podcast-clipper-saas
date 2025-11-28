# ☁️ Cloudinary Setup Guide

## ✅ What I've Done

Installed Cloudinary in both frontend and backend:
- ✅ `npm install cloudinary` (frontend)
- ✅ `pip install cloudinary` (backend)

---

## 🎯 Why Cloudinary > S3

### **Advantages:**
- ✅ **Free tier**: 25GB storage + 25GB bandwidth/month
- ✅ **No CORS setup**: Works out of the box
- ✅ **Simpler API**: Easier than S3
- ✅ **Built-in transformations**: Video processing included
- ✅ **CDN included**: Fast delivery worldwide
- ✅ **Signed uploads**: Secure direct uploads from browser

### **vs AWS S3:**
- S3: Complex IAM, CORS, presigned URLs
- Cloudinary: Simple API keys, works immediately

---

## 🚀 Setup Steps (5 minutes)

### **Step 1: Create Cloudinary Account**

1. Go to: https://cloudinary.com/users/register_free
2. Sign up (free account)
3. Verify your email

### **Step 2: Get Your Credentials**

After signing in, you'll see your dashboard with:

```
Cloud name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

### **Step 3: Add to Environment Variables**

#### **Frontend** (`mylo-frontend/.env`):
```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### **Backend** (Modal secret):
```bash
# Add to Modal secret
modal secret create mylo-secret

# Add these keys:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📝 Update Code

### **Frontend Upload** (Replace S3 upload)

Update `mylo-frontend/src/actions/s3.ts` → rename to `upload.ts`:

```typescript
"use server";

import { v2 as cloudinary } from 'cloudinary';
import { auth } from "~/server/auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "~/server/db";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function generateUploadSignature() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const timestamp = Math.round(new Date().getTime() / 1000);
  const uniqueId = uuidv4();
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: uniqueId,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  const uploadedFileDbRecord = await db.uploadedFile.create({
    data: {
      userId: session.user.id,
      s3Key: `${uniqueId}/original`,
      displayName: "Pending upload",
      uploaded: false,
    },
    select: {
      id: true,
    },
  });

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: uniqueId,
    uploadedFileId: uploadedFileDbRecord.id,
  };
}
```

### **Backend Download** (Replace S3 download)

Update `mylo-backend/main.py`:

```python
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
    api_key=os.environ["CLOUDINARY_API_KEY"],
    api_secret=os.environ["CLOUDINARY_API_SECRET"]
)

# Download video
def download_video_from_cloudinary(public_id: str, output_path: str):
    """Download video from Cloudinary"""
    url = cloudinary.CloudinaryVideo(public_id).build_url()
    response = requests.get(url)
    with open(output_path, 'wb') as f:
        f.write(response.content)

# Upload clip
def upload_clip_to_cloudinary(file_path: str, folder: str):
    """Upload clip to Cloudinary"""
    result = cloudinary.uploader.upload(
        file_path,
        resource_type="video",
        folder=folder
    )
    return result['public_id']
```

---

## 🎨 Frontend Upload Component

Update `mylo-frontend/src/components/dashboard-client.tsx`:

```typescript
const handleUpload = async () => {
  if (files.length === 0) return;

  const file = files[0]!;
  setUploading(true);

  try {
    // Get upload signature
    const { signature, timestamp, cloudName, apiKey, folder, uploadedFileId } = 
      await generateUploadSignature();

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('folder', folder);

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) throw new Error('Upload failed');

    const result = await uploadResponse.json();

    // Update database with public_id
    await updateUploadedFile(uploadedFileId, result.public_id);

    // Trigger processing
    await processVideo(uploadedFileId);

    setFiles([]);
    toast.success("Video uploaded successfully");
  } catch (error) {
    toast.error("Upload failed");
  } finally {
    setUploading(false);
  }
};
```

---

## 🔧 Environment Variables

### **Frontend** (`mylo-frontend/.env`):
```env
# Cloudinary (replaces AWS S3)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### **Backend** (Modal secret):
```bash
# Remove these:
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_S3_BUCKET

# Add these:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📊 Cloudinary Free Tier

**Included:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited uploads
- ✅ CDN delivery
- ✅ Video processing

**Enough for:**
- ~250 videos (100MB each)
- ~2,500 clip downloads/month
- Perfect for launch!

---

## 🎯 Benefits for Mylo

### **Simpler Setup:**
- No IAM policies
- No CORS configuration
- No presigned URLs
- Just API keys!

### **Better Features:**
- Built-in video transformations
- Automatic format optimization
- CDN delivery (faster)
- Thumbnail generation
- Video analytics

### **Cost Effective:**
- Free tier is generous
- Pay-as-you-grow pricing
- No minimum fees
- Cheaper than S3 for small scale

---

## 🚀 Quick Start

1. **Sign up**: https://cloudinary.com/users/register_free
2. **Get credentials**: Dashboard → Account Details
3. **Add to `.env`**: Copy cloud name, API key, API secret
4. **Update code**: Replace S3 calls with Cloudinary
5. **Test**: Upload a video!

---

## 📝 Migration from S3

If you want to keep S3 compatibility, you can:
- Keep S3 code as-is
- Add Cloudinary as alternative
- Use environment variable to switch

Or fully migrate to Cloudinary (recommended for simplicity).

---

## 🎉 Summary

**Cloudinary is installed!**

**Next steps:**
1. Create Cloudinary account (5 min)
2. Get credentials
3. Add to environment variables
4. Update upload/download code
5. Test!

**Much simpler than S3!** ☁️

---

**Need help?** Cloudinary docs: https://cloudinary.com/documentation

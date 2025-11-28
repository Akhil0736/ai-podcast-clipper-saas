# ☁️ Cloudinary Setup Guide

## Quick Start (5 minutes)

### Step 1: Sign Up for Cloudinary
1. Go to: **https://cloudinary.com/users/register_free**
2. Fill in:
   - Email address
   - Password
   - Choose a cloud name (this will be your `CLOUD_NAME`)
3. Click "Sign up for free"
4. Verify your email

**No credit card required!** ✅

---

### Step 2: Get Your Credentials

After signing up and logging in, you'll see your **Dashboard**:

```
┌─────────────────────────────────────────┐
│ Account Details                         │
├─────────────────────────────────────────┤
│ Cloud name:    your-cloud-name          │
│ API Key:       123456789012345          │
│ API Secret:    ••••••••••••••••         │
│                [Show] [Copy]            │
└─────────────────────────────────────────┘
```

Click **"Show"** next to API Secret to reveal it.

**Copy these 3 values:**
1. Cloud name
2. API Key
3. API Secret

---

### Step 3: Add to Frontend Environment

```bash
cd mylo-frontend
```

Edit `.env` file and replace the placeholders:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
CLOUDINARY_API_KEY="your-actual-api-key"
CLOUDINARY_API_SECRET="your-actual-api-secret"
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="mylo-app"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123456"
```

---

### Step 4: Add to Backend (Modal)

```bash
cd mylo-backend
modal secret create mylo-secret
```

When prompted, add these keys:

```
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
GEMINI_API_KEY=your-gemini-key
AUTH_TOKEN=your-auth-token
```

**Or update existing secret:**
```bash
modal secret list  # Find your secret name
modal secret edit mylo-secret
```

---

### Step 5: Test It Works

**Test Frontend:**
```bash
cd mylo-frontend
npm run build
```
✅ Should build successfully (no SKIP_ENV_VALIDATION needed)

**Test Backend:**
```bash
cd mylo-backend
modal deploy main.py
```
✅ Should deploy successfully

**Test Upload:**
```bash
cd mylo-frontend
npm run dev
```
1. Visit http://localhost:3000
2. Login to dashboard
3. Upload a small test video
4. Check Cloudinary dashboard to see uploaded file

---

## 📊 Cloudinary Free Tier

### What You Get (FREE)
- **25 GB** storage
- **25 GB** bandwidth per month
- **Unlimited** transformations
- **CDN** delivery included
- **Video optimization** included
- **No credit card** required

### Limits
- Max file size: **100 MB** per upload
- Max video length: **No limit**
- Max requests: **Unlimited**

### Upgrade Options (if needed)
- **Plus Plan:** $99/month
  - 100 GB storage
  - 100 GB bandwidth
  - Larger file uploads

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ **DO:** Keep `.env` in `.gitignore`
- ✅ **DO:** Use different credentials for dev/prod
- ❌ **DON'T:** Commit credentials to git
- ❌ **DON'T:** Share API secrets publicly

### Cloudinary Settings
1. Go to **Settings** → **Security**
2. Enable **Strict transformations**
3. Set **Allowed fetch domains** (optional)
4. Enable **Resource list** (for listing videos)

---

## 📁 Folder Structure

Your videos will be organized like this in Cloudinary:

```
mylo-videos/
  ├── abc123/
  │   ├── original              ← Uploaded video
  │   ├── abc123_clip_0         ← Generated clip 1
  │   ├── abc123_clip_1         ← Generated clip 2
  │   └── abc123_clip_2         ← Generated clip 3
  ├── def456/
  │   ├── original
  │   ├── def456_clip_0
  │   └── def456_clip_1
  └── ...
```

---

## 🎨 Cloudinary Dashboard Features

### Media Library
- View all uploaded videos
- Search by name or tag
- Preview videos
- Download originals
- Delete videos

### Analytics
- Storage usage
- Bandwidth usage
- Transformation usage
- Geographic distribution
- Popular assets

### Transformations
- Resize videos
- Change format
- Compress videos
- Generate thumbnails
- Add watermarks

---

## 🆘 Troubleshooting

### Problem: "Invalid API credentials"
**Solution:** 
- Double-check cloud name, API key, and secret
- Make sure there are no extra spaces
- Verify you copied the full API secret

### Problem: "Upload failed with 401"
**Solution:**
- Check `.env` file has correct credentials
- Restart dev server after changing `.env`
- Verify API secret is not truncated

### Problem: "Resource not found"
**Solution:**
- Check video was uploaded to Cloudinary
- Verify public_id is correct
- Check folder structure in Cloudinary dashboard

### Problem: "Quota exceeded"
**Solution:**
- Check usage in Cloudinary dashboard
- Delete old test videos
- Upgrade plan if needed

---

## 📚 Useful Links

- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Documentation:** https://cloudinary.com/documentation
- **Video Upload API:** https://cloudinary.com/documentation/video_upload_api_reference
- **Node.js SDK:** https://cloudinary.com/documentation/node_integration
- **Support:** https://support.cloudinary.com

---

## ✅ Setup Complete!

Once you've added your credentials:

1. ✅ Frontend builds successfully
2. ✅ Backend deploys successfully
3. ✅ Videos upload to Cloudinary
4. ✅ Clips are generated
5. ✅ Videos play from CDN

**Your Mylo app is now powered by Cloudinary!** ☁️

---

## 🎯 Next Steps

1. **Test upload flow** with a small video
2. **Verify clips** are generated
3. **Check Cloudinary dashboard** to see your videos
4. **Deploy to production** (Vercel + Modal)
5. **Monitor usage** in Cloudinary analytics

**Need help?** Check `CLOUDINARY_MIGRATION_COMPLETE.md` for detailed migration info.

# 🚀 LAUNCH TOMORROW - Complete Checklist

## ✅ What's Already Done

### **Frontend - 100% Complete**
- ✅ Landing page with marketing copy
- ✅ Login/Signup pages
- ✅ Google OAuth integration (needs credentials)
- ✅ Dashboard with video upload UI
- ✅ Billing page with pricing
- ✅ Credits system
- ✅ All Mylo branding
- ✅ Responsive design
- ✅ Local database working

### **Backend - Code Complete**
- ✅ Python backend code ready
- ✅ Modal app configured
- ✅ Video processing pipeline
- ✅ AI clip generation (Gemini)
- ✅ Face tracking (LR-ASD)
- ✅ Subtitle generation
- ✅ Modal token authenticated

---

## 🎯 What You Need to Do (4-6 hours)

### **1. Google OAuth Setup** (15 minutes)
**Status**: ⏳ Needs credentials

**Steps**:
1. Go to https://console.cloud.google.com/
2. Create project "Mylo"
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth credentials
6. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

**Guide**: See `GOOGLE_OAUTH_SETUP.md`

---

### **2. AWS S3 Setup** (20 minutes)
**Status**: ⏳ Needs bucket and credentials

**Steps**:
1. Go to https://console.aws.amazon.com/s3/
2. Create bucket: `mylo-videos`
3. Region: `us-east-1` (or your choice)
4. Configure CORS:
   ```json
   [
     {
       "AllowedHeaders": ["Content-Type", "Content-Length", "Authorization"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
5. Create IAM user: `mylo-app`
6. Attach policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:ListBucket"],
         "Resource": "arn:aws:s3:::mylo-videos"
       },
       {
         "Effect": "Allow",
         "Action": ["s3:GetObject", "s3:PutObject"],
         "Resource": "arn:aws:s3:::mylo-videos/*"
       }
     ]
   }
   ```
7. Generate access keys
8. Save credentials

---

### **3. Gemini API Key** (5 minutes)
**Status**: ⏳ Needs API key

**Steps**:
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create new API key
4. Copy the key
5. Save for Modal secrets

---

### **4. Modal Backend Deployment** (30 minutes)
**Status**: ✅ Token authenticated, ⏳ Needs secrets and deployment

**Steps**:

#### **A. Create Modal Secret**
```bash
cd mylo-backend
modal secret create mylo-secret
```

When prompted, add these keys:
```
GEMINI_API_KEY=your-gemini-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=mylo-videos
AUTH_TOKEN=generate-random-string-here
```

**Generate AUTH_TOKEN**:
```bash
openssl rand -hex 32
```

#### **B. Deploy Backend**
```bash
cd mylo-backend
modal deploy main.py
```

**Expected output**:
```
✓ Created deployment mylo
✓ App deployed! 🎉

Endpoint: https://[username]--mylo-mylovideoclipper-process-video.modal.run
```

**IMPORTANT**: Copy the endpoint URL!

---

### **5. Database Setup** (15 minutes)
**Status**: ⏳ Needs production database

**Option A: Vercel Postgres** (Recommended)
1. Go to Vercel dashboard
2. Create new Postgres database
3. Copy `DATABASE_URL`

**Option B: Supabase** (Free)
1. Go to https://supabase.com/
2. Create new project
3. Go to Settings → Database
4. Copy connection string

**Option C: Neon** (Free)
1. Go to https://neon.tech/
2. Create new project
3. Copy connection string

---

### **6. Stripe Setup** (30 minutes)
**Status**: ⏳ Needs products and keys

**Steps**:

#### **A. Create Products**
1. Go to https://dashboard.stripe.com/products
2. Create 3 products:

**Small Pack**:
- Name: "Mylo - 50 Credits"
- Price: $9.99 (one-time)
- Copy Price ID

**Medium Pack**:
- Name: "Mylo - 150 Credits"
- Price: $24.99 (one-time)
- Copy Price ID

**Large Pack**:
- Name: "Mylo - 500 Credits"
- Price: $69.99 (one-time)
- Copy Price ID

#### **B. Get API Keys**
1. Go to Developers → API keys
2. Copy:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)

#### **C. Configure Webhook** (After Vercel deployment)
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret

---

### **7. Inngest Setup** (10 minutes)
**Status**: ⏳ Needs keys

**Steps**:
1. Go to https://www.inngest.com/
2. Sign up / Log in
3. Create new app: "Mylo"
4. Go to Settings → Keys
5. Copy:
   - Event Key
   - Signing Key

---

### **8. Frontend Environment Variables** (10 minutes)
**Status**: ⏳ Needs all credentials

Update `mylo-frontend/.env` with all credentials:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
AUTH_SECRET="generate-with-npx-auth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Base URL
BASE_URL="https://yourdomain.com"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET_NAME="mylo-videos"

# Modal Backend
PROCESS_VIDEO_ENDPOINT="https://[your-modal-endpoint]"
PROCESS_VIDEO_ENDPOINT_AUTH="[your-auth-token]"

# Stripe
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_SMALL_CREDIT_PACK="price_..."
STRIPE_MEDIUM_CREDIT_PACK="price_..."
STRIPE_LARGE_CREDIT_PACK="price_..."

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
```

---

### **9. Vercel Deployment** (20 minutes)
**Status**: ⏳ Ready to deploy

**Steps**:

#### **A. Connect GitHub**
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "feat: Complete Mylo rebranding and Google OAuth"
   git push origin main
   ```

#### **B. Deploy to Vercel**
1. Go to https://vercel.com/
2. Click "New Project"
3. Import your GitHub repo
4. Framework: Next.js (auto-detected)
5. Root Directory: `mylo-frontend`
6. Click "Deploy"

#### **C. Add Environment Variables**
1. Go to Project Settings → Environment Variables
2. Add ALL variables from step 8
3. Redeploy

#### **D. Update Database Schema**
```bash
# In Vercel dashboard, go to Deployments
# Click on latest deployment → View Function Logs
# Or run locally then push:
cd mylo-frontend
npx prisma migrate deploy
```

---

### **10. Update OAuth Redirect URLs** (5 minutes)
**Status**: ⏳ After Vercel deployment

**Google Cloud Console**:
1. Go to your OAuth credentials
2. Add authorized origins:
   ```
   https://yourdomain.com
   ```
3. Add redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

---

### **11. Final Testing** (30 minutes)
**Status**: ⏳ After everything is deployed

**Test Checklist**:
- [ ] Visit landing page
- [ ] Sign up with email/password
- [ ] Sign up with Google
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Check credits (should be 10)
- [ ] Upload a test video (small, < 100MB)
- [ ] Wait for processing
- [ ] Check clips generated
- [ ] Download a clip
- [ ] Go to billing page
- [ ] Test Stripe checkout (use test card: 4242 4242 4242 4242)
- [ ] Verify credits added
- [ ] Upload another video
- [ ] Sign out
- [ ] Sign back in

---

## 📊 Time Estimate

| Task | Time | Status |
|------|------|--------|
| Google OAuth | 15 min | ⏳ |
| AWS S3 | 20 min | ⏳ |
| Gemini API | 5 min | ⏳ |
| Modal Deploy | 30 min | ⏳ |
| Database | 15 min | ⏳ |
| Stripe | 30 min | ⏳ |
| Inngest | 10 min | ⏳ |
| Env Variables | 10 min | ⏳ |
| Vercel Deploy | 20 min | ⏳ |
| OAuth URLs | 5 min | ⏳ |
| Testing | 30 min | ⏳ |
| **TOTAL** | **~4 hours** | |

---

## 🎯 Priority Order

### **Critical (Must Have)**
1. ✅ Modal token (DONE)
2. ⏳ AWS S3 (video storage)
3. ⏳ Gemini API (clip detection)
4. ⏳ Modal deployment (video processing)
5. ⏳ Database (user data)
6. ⏳ Vercel deployment (hosting)

### **Important (Should Have)**
7. ⏳ Stripe (payments)
8. ⏳ Inngest (queue)
9. ⏳ Google OAuth (better UX)

### **Nice to Have**
10. Custom domain
11. Email notifications
12. Analytics

---

## 🚨 Common Issues & Solutions

### **Modal Deployment Fails**
**Solution**: Check that all secrets are set correctly
```bash
modal secret list
```

### **Video Upload Fails**
**Solution**: Check S3 CORS configuration and credentials

### **Video Processing Fails**
**Solution**: Check Modal logs
```bash
modal logs mylo
```

### **Stripe Webhook Fails**
**Solution**: Check webhook signing secret matches

### **Database Connection Fails**
**Solution**: Check DATABASE_URL format and network access

---

## ✅ Launch Checklist

### **Pre-Launch**
- [ ] All services configured
- [ ] Environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Modal
- [ ] Database migrated
- [ ] End-to-end test passed
- [ ] Stripe test payment works
- [ ] Video processing works

### **Launch Day**
- [ ] Switch Stripe to live mode
- [ ] Update Stripe keys in Vercel
- [ ] Test with real payment
- [ ] Monitor Modal logs
- [ ] Monitor Vercel logs
- [ ] Check error tracking

### **Post-Launch**
- [ ] Monitor user signups
- [ ] Check video processing success rate
- [ ] Monitor costs (Modal, S3, Vercel)
- [ ] Collect user feedback
- [ ] Fix any bugs

---

## 💰 Cost Estimate (Monthly)

**For 100 users processing 500 videos/month:**

- **Vercel**: Free (Hobby plan)
- **Modal**: ~$50-100 (GPU usage)
- **AWS S3**: ~$10-20 (storage + transfer)
- **Database**: Free (Vercel Postgres or Supabase)
- **Stripe**: 2.9% + $0.30 per transaction
- **Inngest**: Free (up to 50k runs)
- **Google OAuth**: Free
- **Gemini API**: ~$10-20

**Total**: ~$70-150/month

---

## 🎉 You're Almost There!

**What's Done**:
- ✅ Complete frontend
- ✅ Complete backend code
- ✅ Modal authenticated
- ✅ Google OAuth integrated
- ✅ All branding complete

**What's Left**:
- ⏳ 4-6 hours of setup
- ⏳ Get API keys
- ⏳ Deploy services
- ⏳ Test everything

**Tomorrow you launch!** 🚀

---

## 📚 Documentation

- `GOOGLE_OAUTH_SETUP.md` - Google OAuth guide
- `QUICK_START.md` - Quick deployment guide
- `MIGRATION_CHECKLIST.md` - Complete migration guide
- `LANDING_PAGE_COMPLETE.md` - Landing page details
- `LOGIN_INSTRUCTIONS.md` - Local testing guide

---

**Need help?** Follow this checklist step by step and you'll be live tomorrow!

Good luck with your launch! 🚀

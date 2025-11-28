# Mylo - Quick Start Deployment Guide

## 🚀 Fast Track Deployment (30 minutes)

### Prerequisites
- [ ] AWS account with S3 access
- [ ] Modal account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] Stripe account (for payments)
- [ ] Inngest account (for queues)
- [ ] Gemini API key (for AI processing)

---

## Step 1: AWS S3 Setup (5 min)

```bash
# Create bucket via AWS Console or CLI
aws s3 mb s3://mylo-videos --region us-east-1

# Create IAM user "mylo-app" with S3 access
# Attach policy: AmazonS3FullAccess (or custom policy from MIGRATION_CHECKLIST.md)

# Generate access keys and save them:
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_SECRET_ACCESS_KEY=...
```

**CORS Configuration** (in S3 Console → Permissions → CORS):
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

---

## Step 2: Modal Backend Deployment (10 min)

```bash
# Install Modal
pip install modal

# Authenticate
modal setup

# Create secret
modal secret create mylo-secret

# Add these keys via Modal dashboard (modal.com → Secrets → mylo-secret):
# - GEMINI_API_KEY: your_gemini_key
# - AWS_ACCESS_KEY_ID: AKIA...
# - AWS_SECRET_ACCESS_KEY: ...
# - AWS_S3_BUCKET: mylo-videos
# - AUTH_TOKEN: generate_random_string_here

# Deploy backend
cd mylo-backend
modal deploy main.py

# ✅ Copy the endpoint URL that appears after deployment
# Example: https://username--mylo-mylovideoclipper-process-video.modal.run
```

---

## Step 3: Database Setup (5 min)

**Option A: Vercel Postgres (Recommended)**
```bash
# In Vercel dashboard:
# 1. Create new Postgres database
# 2. Copy DATABASE_URL
```

**Option B: Supabase**
```bash
# 1. Create project at supabase.com
# 2. Get connection string from Settings → Database
```

**Option C: Local (Development)**
```bash
# Use SQLite for local testing
DATABASE_URL="file:./db.sqlite"
```

---

## Step 4: Frontend Environment Variables (5 min)

Create `mylo-frontend/.env`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth (generate secret)
AUTH_SECRET="$(npx auth secret)"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 (from Step 1)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="mylo-videos"

# Modal Backend (from Step 2)
PROCESS_VIDEO_ENDPOINT="https://username--mylo-mylovideoclipper-process-video.modal.run"
PROCESS_VIDEO_ENDPOINT_AUTH="same_as_modal_AUTH_TOKEN"

# Stripe (get from stripe.com/dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Configure after deployment

# Inngest (get from inngest.com/dashboard)
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
```

---

## Step 5: Local Testing (5 min)

```bash
cd mylo-frontend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# In another terminal, start Inngest dev server
npm run inngest-dev

# ✅ Open http://localhost:3000
# ✅ Test signup, login, and upload flow
```

---

## Step 6: Vercel Deployment (5 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd mylo-frontend
vercel --prod

# Or via Vercel Dashboard:
# 1. Connect GitHub repository
# 2. Add all environment variables from Step 4
# 3. Deploy from main branch
```

**After deployment:**
1. Copy production URL (e.g., `https://mylo.vercel.app`)
2. Update `NEXTAUTH_URL` to production URL
3. Redeploy

---

## Step 7: Stripe Webhook Configuration (3 min)

```bash
# In Stripe Dashboard:
# 1. Go to Developers → Webhooks
# 2. Add endpoint: https://yourdomain.com/api/webhooks/stripe
# 3. Select events:
#    - checkout.session.completed
#    - customer.subscription.created
#    - customer.subscription.updated
#    - customer.subscription.deleted
# 4. Copy webhook signing secret
# 5. Add to Vercel environment variables as STRIPE_WEBHOOK_SECRET
# 6. Redeploy frontend
```

---

## Step 8: Final Verification (2 min)

### Test Checklist:
- [ ] Visit production URL
- [ ] Sign up new user
- [ ] Upload test video (< 100MB for testing)
- [ ] Verify video appears in queue
- [ ] Wait for processing (check Modal logs)
- [ ] Verify clips appear in "My Clips" tab
- [ ] Test clip download
- [ ] Test Stripe payment flow (use test card: 4242 4242 4242 4242)
- [ ] Verify credits are added after payment

---

## 🎯 Quick Commands Reference

### Check Modal logs:
```bash
modal logs mylo
```

### Check Vercel logs:
```bash
vercel logs
```

### Rebuild frontend:
```bash
cd mylo-frontend
npm run build
```

### Run database migrations:
```bash
cd mylo-frontend
npx prisma migrate deploy
```

### Test Modal endpoint:
```bash
curl -X POST https://your-modal-endpoint.modal.run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_auth_token" \
  -d '{"s3_key": "test/video.mp4"}'
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Module not found" errors
```bash
cd mylo-frontend
rm -rf node_modules .next
npm install
npm run build
```

### Issue: Database connection fails
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db push
```

### Issue: Modal deployment fails
```bash
# Check secrets
modal secret list

# Verify Python dependencies
cd mylo-backend
pip install -r requirements.txt

# Try deploying again
modal deploy main.py
```

### Issue: S3 upload fails (CORS error)
```bash
# Verify CORS configuration in S3 Console
# Ensure AllowedOrigins includes your domain or "*"
```

### Issue: Video processing fails
```bash
# Check Modal logs
modal logs mylo

# Common causes:
# - Invalid Gemini API key
# - S3 bucket name mismatch
# - Insufficient GPU quota on Modal
```

---

## 📊 Cost Estimate (Free Tier)

- **Modal**: Free tier includes 30 GPU hours/month
- **Vercel**: Free tier includes unlimited deployments
- **AWS S3**: ~$0.023/GB storage + $0.09/GB transfer
- **Stripe**: 2.9% + $0.30 per transaction
- **Inngest**: Free tier includes 50k function runs/month
- **Database**: Vercel Postgres free tier or Supabase free tier

**Estimated monthly cost for 100 videos**: $5-10

---

## 🎉 Success!

If all steps completed successfully, you now have:
- ✅ Fully deployed Mylo application
- ✅ Backend processing on Modal
- ✅ Frontend on Vercel
- ✅ Payment processing with Stripe
- ✅ Queue system with Inngest
- ✅ Video storage on S3

**Next steps:**
1. Add custom domain in Vercel
2. Configure email notifications
3. Add analytics (PostHog, Plausible, etc.)
4. Set up monitoring (Sentry, LogRocket, etc.)

---

## 📚 Additional Resources

- **Full Migration Guide**: `MIGRATION_CHECKLIST.md`
- **Complete Summary**: `REBRANDING_SUMMARY.md`
- **Project README**: `README.md`
- **Environment Variables**: `mylo-frontend/.env.example`

---

**Need help?** Check the troubleshooting section in `MIGRATION_CHECKLIST.md`

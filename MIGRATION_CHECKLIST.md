# Mylo Rebranding - Migration Checklist

## Summary

**Rebranding Complete**: AI Podcast Clipper → Mylo

- **Total files modified**: 13 files
- **Directories renamed**: 2 directories
- **Total replacements**: 50+ occurrences
- **Estimated deployment time**: 30-45 minutes

---

## Files Modified

### Backend (Python)
1. ✅ `mylo-backend/main.py` - 8 changes
   - Modal app name: "ai-podcast-clipper" → "mylo"
   - Modal volume: "ai-podcast-clipper-model-cache" → "mylo-model-cache"
   - Modal secret: "ai-podcast-clipper-secret" → "mylo-secret"
   - S3 bucket: Hardcoded → Environment variable
   - Class name: AiPodcastClipper → MyloVideoClipper
   - Comments: "podcast" → "video"

### Frontend (TypeScript/React)
2. ✅ `mylo-frontend/package.json` - Package name updated
3. ✅ `mylo-frontend/package-lock.json` - Package name updated
4. ✅ `mylo-frontend/src/inngest/client.ts` - Inngest ID updated
5. ✅ `mylo-frontend/src/app/dashboard/billing/page.tsx` - All "podcast" → "video"
6. ✅ `mylo-frontend/src/components/nav-header.tsx` - Logo updated to "Mylo"
7. ✅ `mylo-frontend/src/components/dashboard-client.tsx` - UI text updated
8. ✅ `mylo-frontend/.env.example` - Complete rewrite with Mylo branding

### Configuration Files
9. ✅ `.gitignore` - Directory paths updated
10. ✅ `README.md` - Complete branding update
11. ✅ `mylo-frontend/README.md` - Title and description updated

### Directories Renamed
- ✅ `ai-podcast-clipper-backend/` → `mylo-backend/`
- ✅ `ai-podcast-clipper-frontend/` → `mylo-frontend/`

---

## Environment Variables to Update

### Modal Deployment (Backend)
Create Modal secrets with these names:

```bash
modal secret create mylo-secret
```

Add these keys to the `mylo-secret`:
- [ ] `GEMINI_API_KEY` - Your Gemini API key
- [ ] `AWS_ACCESS_KEY_ID` - AWS IAM user access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS IAM user secret key
- [ ] `AWS_S3_BUCKET` - Set to "mylo-videos"
- [ ] `AUTH_TOKEN` - Bearer token for API authentication

### Vercel Deployment (Frontend)
Add these environment variables in Vercel dashboard:

**Database:**
- [ ] `DATABASE_URL` - PostgreSQL connection string

**Authentication:**
- [ ] `AUTH_SECRET` - Generate with: `npx auth secret`
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., https://mylo.app)

**AWS S3:**
- [ ] `AWS_ACCESS_KEY_ID` - Same as backend
- [ ] `AWS_SECRET_ACCESS_KEY` - Same as backend
- [ ] `AWS_REGION` - e.g., "us-east-1"
- [ ] `AWS_S3_BUCKET` - Set to "mylo-videos"

**Modal Backend:**
- [ ] `PROCESS_VIDEO_ENDPOINT` - Your Modal endpoint URL (get after deploying backend)
- [ ] `PROCESS_VIDEO_ENDPOINT_AUTH` - Bearer token matching backend AUTH_TOKEN

**Stripe:**
- [ ] `STRIPE_SECRET_KEY` - From Stripe dashboard
- [ ] `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as above (public)
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe webhook configuration

**Inngest:**
- [ ] `INNGEST_EVENT_KEY` - From Inngest dashboard
- [ ] `INNGEST_SIGNING_KEY` - From Inngest dashboard

---

## Infrastructure Changes Required

### 1. AWS S3 Bucket
**Action**: Create new S3 bucket

```bash
# Bucket name: mylo-videos
# Region: us-east-1 (or your preferred region)
```

**CORS Configuration:**
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

**IAM Policy:**
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

- [ ] Create S3 bucket: `mylo-videos`
- [ ] Configure CORS policy
- [ ] Create IAM user with S3 access
- [ ] Generate access keys
- [ ] Test upload/download permissions

### 2. Modal Backend
**Action**: Deploy new Modal app

```bash
cd mylo-backend

# Setup Modal (if not already done)
modal setup

# Create Modal secret
modal secret create mylo-secret

# Add environment variables to secret via Modal dashboard or CLI

# Deploy backend
modal deploy main.py
```

- [ ] Install Modal CLI: `pip install modal`
- [ ] Run `modal setup` and authenticate
- [ ] Create `mylo-secret` with all required keys
- [ ] Deploy: `modal deploy main.py`
- [ ] Copy the endpoint URL for frontend configuration
- [ ] Test endpoint with sample request

**Expected Output:**
```
✓ Created deployment mylo
✓ App deployed! 🎉

View Deployment: https://modal.com/apps/...
Endpoint: https://[username]--mylo-mylovideoclipper-process-video.modal.run
```

### 3. Database (PostgreSQL)
**Action**: Update database if needed

- [ ] No schema changes required (models are generic)
- [ ] Existing data remains compatible
- [ ] Update `DATABASE_URL` in environment variables
- [ ] Run migrations if any: `npx prisma migrate deploy`

### 4. Vercel Frontend
**Action**: Deploy frontend

```bash
cd mylo-frontend

# Install dependencies
npm install

# Build locally to test
npm run build

# Deploy to Vercel
vercel --prod
```

- [ ] Connect GitHub repository to Vercel
- [ ] Configure all environment variables in Vercel dashboard
- [ ] Deploy from main branch
- [ ] Configure custom domain (optional)
- [ ] Test production deployment

### 5. Stripe Configuration
**Action**: Update product descriptions (optional)

- [ ] Update product names to reference "Mylo" instead of "Podcast Clipper"
- [ ] Update product descriptions
- [ ] Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Copy webhook signing secret to environment variables
- [ ] Test payment flow in test mode

### 6. Inngest Configuration
**Action**: Update Inngest app

- [ ] Update app name to "mylo-frontend" (already done in code)
- [ ] Verify event keys are configured
- [ ] Test queue processing
- [ ] Monitor function executions

---

## Deployment Sequence

Follow this order to minimize downtime:

### Step 1: AWS Setup (15 minutes)
1. Create S3 bucket `mylo-videos`
2. Configure CORS and IAM policies
3. Generate and save access keys

### Step 2: Modal Backend Deployment (10 minutes)
1. Create Modal secret with all environment variables
2. Deploy backend: `modal deploy main.py`
3. Copy endpoint URL
4. Test endpoint with curl or Postman

### Step 3: Database Migration (5 minutes)
1. Update DATABASE_URL if needed
2. Run `npx prisma migrate deploy` (if needed)
3. Verify database connectivity

### Step 4: Vercel Frontend Deployment (10 minutes)
1. Configure all environment variables in Vercel
2. Add Modal endpoint URL from Step 2
3. Deploy frontend
4. Verify build succeeds

### Step 5: Integration Testing (10 minutes)
1. Test user signup/login
2. Test video upload
3. Test video processing end-to-end
4. Test clip generation
5. Test Stripe payment flow

---

## Verification Commands

### Check for remaining "podcast" references:
```bash
grep -r "podcast" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.kiro
```
**Expected**: 0 matches in code files

### Verify Python syntax:
```bash
python3 -m py_compile mylo-backend/main.py
```
**Expected**: No errors

### Verify frontend build:
```bash
cd mylo-frontend
npm run build
```
**Expected**: Build completes successfully

### Test Modal deployment locally:
```bash
cd mylo-backend
modal run main.py
```
**Expected**: Function executes without errors

---

## Rollback Plan

If critical issues occur during deployment:

### Backend Rollback:
```bash
# Redeploy previous version
modal deploy main.py --tag previous
```

### Frontend Rollback:
```bash
# In Vercel dashboard, revert to previous deployment
# Or via CLI:
vercel rollback
```

### Database Rollback:
- No schema changes were made, so no rollback needed
- Existing data remains compatible

**Estimated rollback time**: 10 minutes

---

## Post-Deployment Verification

### Functional Tests:
- [ ] User can sign up
- [ ] User can log in
- [ ] User can upload video
- [ ] Video processing starts
- [ ] Clips are generated
- [ ] Clips can be downloaded
- [ ] Credits are deducted correctly
- [ ] Stripe payment works
- [ ] Inngest queue processes jobs

### Performance Tests:
- [ ] Frontend loads in < 3 seconds
- [ ] Video upload completes successfully
- [ ] Processing completes within expected time
- [ ] No console errors in browser
- [ ] No errors in Modal logs

### Security Tests:
- [ ] Environment variables are not exposed
- [ ] S3 bucket has proper permissions
- [ ] API endpoints require authentication
- [ ] Stripe webhooks verify signatures

---

## Troubleshooting

### Issue: Modal deployment fails
**Solution**: 
- Check that all secrets are configured: `modal secret list`
- Verify Python dependencies: `pip install -r requirements.txt`
- Check Modal logs: `modal logs mylo`

### Issue: Frontend build fails
**Solution**:
- Clear cache: `rm -rf .next node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify environment variables are set

### Issue: S3 upload fails
**Solution**:
- Verify CORS configuration
- Check IAM permissions
- Test with AWS CLI: `aws s3 ls s3://mylo-videos`

### Issue: Video processing fails
**Solution**:
- Check Modal logs for errors
- Verify Gemini API key is valid
- Ensure S3 bucket name matches environment variable
- Check GPU availability on Modal

---

## Success Criteria

✅ All files updated with "Mylo" branding
✅ No references to "podcast clipper" in code
✅ Backend deploys successfully to Modal
✅ Frontend deploys successfully to Vercel
✅ End-to-end video processing works
✅ Payment flow works correctly
✅ All tests pass

---

## Next Steps After Deployment

1. **Monitor**: Watch Modal and Vercel logs for errors
2. **Test**: Run through complete user flow multiple times
3. **Optimize**: Review performance metrics
4. **Document**: Update any additional documentation
5. **Announce**: Inform users of the rebrand (if applicable)

---

## Support Resources

- **Modal Documentation**: https://modal.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Stripe Documentation**: https://stripe.com/docs
- **Inngest Documentation**: https://www.inngest.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

**Rebranding completed successfully! 🎉**

For questions or issues, refer to the troubleshooting section above.

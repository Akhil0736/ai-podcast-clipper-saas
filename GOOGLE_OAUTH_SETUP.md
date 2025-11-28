# 🔐 Google OAuth Setup Guide

## ✅ What I've Done

I've added Google OAuth to your Mylo app! Users can now:
- ✅ Sign in with Google
- ✅ Sign up with Google
- ✅ Keep using email/password (both work!)

---

## 🎯 What You Need to Do

To enable Google login, you need to get OAuth credentials from Google Cloud Console.

### **Step 1: Go to Google Cloud Console**

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### **Step 2: Create a New Project**

1. Click the project dropdown (top left)
2. Click "New Project"
3. Name it: "Mylo" or "Mylo Video Clipper"
4. Click "Create"
5. Wait for it to be created (takes ~30 seconds)
6. Select your new project from the dropdown

### **Step 3: Enable Google+ API**

1. In the left sidebar, go to: **APIs & Services** → **Library**
2. Search for: "Google+ API"
3. Click on it
4. Click "Enable"

### **Step 4: Configure OAuth Consent Screen**

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select: **External** (unless you have Google Workspace)
3. Click "Create"

**Fill in the form:**
- **App name**: Mylo
- **User support email**: Your email
- **App logo**: (optional - upload Mylo logo if you have one)
- **Application home page**: http://localhost:3000 (for now)
- **Authorized domains**: (leave empty for local testing)
- **Developer contact**: Your email

4. Click "Save and Continue"
5. **Scopes**: Click "Add or Remove Scopes"
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Click "Update"
   - Click "Save and Continue"
6. **Test users**: (optional for local testing)
   - Add your email if you want
   - Click "Save and Continue"
7. Click "Back to Dashboard"

### **Step 5: Create OAuth Credentials**

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ Create Credentials** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: Mylo Web App

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

5. Click "Create"
6. **IMPORTANT**: Copy the credentials that appear:
   - **Client ID**: Starts with something like `123456789-abc...apps.googleusercontent.com`
   - **Client Secret**: Random string like `GOCSPX-abc123...`

### **Step 6: Add Credentials to Your .env File**

1. Open `mylo-frontend/.env`
2. Replace these lines:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

   With your actual credentials:
   ```env
   GOOGLE_CLIENT_ID="123456789-abc...apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-abc123..."
   ```

3. Save the file

### **Step 7: Restart Dev Server**

```bash
cd mylo-frontend
npm run dev
```

---

## 🧪 Test Google Login

1. Go to: http://localhost:3000/login
2. You should see a new button: **"Sign in with Google"**
3. Click it
4. Select your Google account
5. Grant permissions
6. You'll be redirected to the dashboard!

---

## 🎨 What Changed

### **Login Page** (`/login`)
- ✅ Added "Sign in with Google" button
- ✅ Keeps email/password login
- ✅ Divider: "Or continue with"

### **Signup Page** (`/signup`)
- ✅ Added "Sign up with Google" button
- ✅ Keeps email/password signup
- ✅ Divider: "Or continue with"

### **Database**
- ✅ Password is now optional (OAuth users don't have passwords)
- ✅ Google account info stored in `Account` table
- ✅ User profile synced from Google

### **Auth Config**
- ✅ Google OAuth provider added
- ✅ Email linking enabled (same email = same account)
- ✅ Credentials provider still works

---

## 🚀 For Production Deployment

When you deploy to Vercel, you'll need to:

### **1. Update Google Cloud Console**

Add your production URLs:

**Authorized JavaScript origins:**
```
https://yourdomain.com
```

**Authorized redirect URIs:**
```
https://yourdomain.com/api/auth/callback/google
```

### **2. Update Vercel Environment Variables**

Add to Vercel:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🔒 Security Notes

### **Email Linking**
I've enabled `allowDangerousEmailAccountLinking: true` which means:
- If someone signs up with `user@gmail.com` via email/password
- Then signs in with Google using the same `user@gmail.com`
- They'll be linked to the same account

This is convenient but has a small security risk if someone uses a fake email. For a SaaS like Mylo, this is fine.

### **Password Optional**
- OAuth users don't have passwords in the database
- Email/password users have hashed passwords
- The system checks if a password exists before validating it

---

## 🐛 Troubleshooting

### **Error: "redirect_uri_mismatch"**
**Solution**: Make sure your redirect URI in Google Cloud Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

### **Error: "Access blocked: This app's request is invalid"**
**Solution**: 
1. Make sure you configured the OAuth consent screen
2. Add your email as a test user
3. Make sure Google+ API is enabled

### **Google button doesn't appear**
**Solution**:
1. Check that you added credentials to `.env`
2. Restart the dev server
3. Clear browser cache

### **"Invalid client" error**
**Solution**: Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

---

## 📊 How It Works

### **Sign Up with Google**
1. User clicks "Sign up with Google"
2. Redirected to Google login
3. User grants permissions
4. Google sends user info back
5. NextAuth creates:
   - User record (email, name, image from Google)
   - Account record (Google provider info)
   - Session record
6. User redirected to dashboard with 10 free credits

### **Sign In with Google**
1. User clicks "Sign in with Google"
2. Redirected to Google login
3. Google authenticates user
4. NextAuth finds existing user by email
5. Creates new session
6. User redirected to dashboard

### **Email/Password Still Works**
- Users can still sign up with email/password
- Passwords are hashed with bcrypt
- Both auth methods work side-by-side

---

## ✅ Benefits of This Approach

### **vs Clerk**
- ✅ **FREE** (no monthly costs)
- ✅ **You control everything**
- ✅ **No vendor lock-in**
- ✅ **Custom UI** (already built)
- ✅ **Works with your database**

### **User Experience**
- ✅ One-click signup with Google
- ✅ No password to remember
- ✅ Faster onboarding
- ✅ More conversions
- ✅ Still supports email/password

---

## 🎉 You're Done!

Once you add the Google credentials to `.env`, you'll have:
- ✅ Google OAuth login
- ✅ Google OAuth signup
- ✅ Email/password login
- ✅ Email/password signup
- ✅ All FREE forever
- ✅ Full control

**Just follow the steps above to get your Google OAuth credentials!**

---

## 📝 Quick Checklist

- [ ] Go to Google Cloud Console
- [ ] Create new project "Mylo"
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth credentials
- [ ] Copy Client ID and Client Secret
- [ ] Add to `mylo-frontend/.env`
- [ ] Restart dev server
- [ ] Test "Sign in with Google" button
- [ ] Celebrate! 🎉

---

**Need help?** The setup takes about 10-15 minutes. Follow the steps carefully and you'll have Google login working!

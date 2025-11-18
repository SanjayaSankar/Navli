# Quick Deployment Guide

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1: Update Your API Keys

Edit `.env.local` with your actual credentials:

```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

Get your keys from:
- **Gemini API:** https://aistudio.google.com/app/apikey
- **Supabase:** https://app.supabase.com (Project Settings → API)

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 3: Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect the Vite framework
4. Add environment variables in the dashboard:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Step 4: Done! 🎉

Your app will be live at `https://your-project.vercel.app`

## Alternative: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## ⚠️ Important Security Notes

- **NEVER commit `.env.local` to git** (already in .gitignore)
- Keep your API keys secret
- For production, consider using Supabase Row Level Security (RLS)
- Rotate keys if accidentally exposed

## Troubleshooting

### Build fails
- Check all environment variables are set in Vercel dashboard
- Ensure variable names start with `VITE_`
- Review build logs in Vercel

### App loads but API fails
- Verify environment variables in Vercel dashboard
- Check browser console for error messages
- Confirm API keys are valid and active

### Changes not deploying
- Check the deployment status in Vercel dashboard
- Ensure you pushed to the correct branch
- Try redeploying from Vercel dashboard

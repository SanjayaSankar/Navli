

# Navli - Intelligent Travel Planner

An AI-powered travel planning application built with React, TypeScript, Vite, Gemini AI, and Supabase.


## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Supabase project ([Create one here](https://app.supabase.com))

## Run Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd navli---intelligent-travel-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your actual API keys:
   ```env
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel**
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Vite project

3. **Configure Environment Variables**

   In the Vercel project settings, add these environment variables:
   - `VITE_GEMINI_API_KEY` - Your Gemini API key
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. **Deploy**

   Click "Deploy" and Vercel will build and deploy your app automatically.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI-powered suggestions | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL for authentication | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Preview Production Build Locally

```bash
npm run preview
```

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite 6
- **AI:** Google Gemini 2.5 Flash
- **Backend/Auth:** Supabase
- **UI:** Lucide React Icons, Recharts
- **Deployment:** Vercel

## Project Structure

```
navli---intelligent-travel-planner/
├── components/          # React components
├── lib/                # Utility libraries (Supabase client)
├── services/           # API services (Gemini)
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── vite.config.ts      # Vite configuration
├── vercel.json         # Vercel deployment config
└── .env.local          # Local environment variables (not in git)
```

## Troubleshooting

### Environment variables not loading
- Make sure variable names start with `VITE_`
- Restart the dev server after changing `.env.local`
- Check that `.env.local` is not committed to git

### Build fails on Vercel
- Verify all environment variables are set in Vercel dashboard
- Check build logs for specific errors
- Ensure `vercel.json` is present in the root directory

### API errors
- Verify your Gemini API key is valid
- Check Supabase project is active and credentials are correct
- Check browser console for detailed error messages

## License

MIT

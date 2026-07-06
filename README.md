# Reimaginator - Vercel Deployment Guide

This app is ready to be deployed to Vercel as a static Single Page Application (SPA).

## Deployment Steps

1. **Push to GitHub/GitLab/Bitbucket**: Ensure your code is in a repository.
2. **Import to Vercel**: Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. **Configure Environment Variables**:
   In the Vercel project settings, add the following environment variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
4. **Deploy**: Vercel will automatically detect the Vite project and deploy it.

## Configuration Details

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Routing**: A `vercel.json` file has been added to handle client-side routing (SPA fallback).

## Note on API Keys
The app is configured to use the `GEMINI_API_KEY` from the environment. In the AI Studio preview, it also supports the dynamic key selection dialog. When deployed to Vercel, it will fallback to the environment variable you provide in the dashboard.

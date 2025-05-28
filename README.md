# EZVEP Website

Modern React website for EZVEP featuring Google Reviews integration.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Vercel Deployment Instructions

This application is configured for deployment on Vercel with serverless API endpoints. Follow these steps to deploy:

### 1. Prerequisites

- A GitHub account with this repository pushed to it
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Google Places API key for reviews functionality

### 2. Connect to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Select Next.js (for compatibility with API routes)
   - **Root Directory**: Keep as is (should be `/`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3. Environment Variables

Add these environment variables in the Vercel project settings:

```
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_PLACE_ID=ChIJ88pp-7EZtE0RttmdZtbpdMc
NODE_ENV=production
```

### 4. Deploy

Click **Deploy** and Vercel will build and deploy your application.

### 5. Verify API Endpoints

After deployment, test the API endpoints:

- Google Reviews: `https://your-domain.vercel.app/api/google-reviews`
- Manual Reviews: `https://your-domain.vercel.app/api/manual-reviews`

## Project Structure

```
EZVEP/
├── api/                  # Serverless functions (backend)
│   ├── google-reviews/
│   │   └── index.js      # Google Reviews API endpoint
│   └── manual-reviews/
│       └── index.js      # Manual Reviews API endpoint 
├── public/               # Static assets
├── src/                  # React frontend code
│   ├── components/       # Reusable components
│   ├── common/           # Common utilities
│   └── pages/            # Page components
├── package.json          # Project dependencies
└── vercel.json           # Vercel configuration
```

## Key Features

- Modern React UI with responsive design
- Google Reviews integration with profile photos
- Fallback to local reviews when API is unavailable
- Serverless API endpoints for backend functionality
- SEO optimized structure
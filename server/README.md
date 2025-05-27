# EZVEP Website Integration Guide

This document explains how to set up Google Ads tracking and Google Reviews integration for your EZVEP website.

## Google Ads & Tag Manager Setup

I've added the necessary scripts to your website to track conversions and set up Google Tag Manager. Here are the placeholders you need to replace:

1. In `public/index.html`:
   - Replace `GTM-XXXXXXX` with your Google Tag Manager container ID (appears in two places)
   - Replace `AW-XXXXXXXXXX` with your Google Ads conversion ID

2. In `src/pages/ThankYou/index.tsx`:
   - Replace `AW-XXXXXXXXXX/YYYYYYYYYYY` with your Google Ads conversion ID and label
   - Format: `AW-123456789/abC-D_efG-h1jK2lm3`

## Google Business Profile Reviews Integration

I've set up a backend API endpoint to fetch reviews from your Google Business Profile using your Place ID (ChIJ88pp-7EZtE0RttmdZtbpdMc). 

### Steps to Complete Setup:

1. **Get a Google Places API Key**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or use an existing one
   - Enable the "Places API"
   - Create an API key with appropriate restrictions

2. **Set up the Environment Variables**:
   - Copy `.env.example` to `.env` in the server directory
   - Add your Google Places API key to the `.env` file

3. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Start the Backend Server**:
   ```bash
   npm run dev
   ```

## Google Ads Conversion Tracking

The conversion tracking is set up to track when users submit the contact form. After submission, they'll be redirected to a "Thank You" page which will trigger the conversion event in Google Ads.

### Testing Your Setup:

1. Fill out the contact form on your site
2. Check that you're redirected to the Thank You page
3. Verify in Google Tag Manager and Google Ads that the conversion was recorded

## Important Notes:

- The backend server must be running for the Google Reviews to be fetched from your Google Business Profile
- For production deployment, you'll need to set up environment variables on your hosting platform
- Your Google Places API key should be kept secret and never exposed in client-side code

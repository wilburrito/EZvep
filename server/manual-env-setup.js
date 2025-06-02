/**
 * Manual environment variable setup script
 * 
 * This helps set Stripe credentials manually when dotenv fails to load .env file
 *
 * ======== HOW TO SET UP YOUR STRIPE API KEYS ========
 * 1. Log in to your Stripe Dashboard at https://dashboard.stripe.com/
 * 2. Go to Developers -> API keys
 * 3. Copy your Secret key and Publishable key
 * 4. Paste them below in the respective fields
 * 5. For testing, you can use the Test mode keys
 * 6. For production, use the Live mode keys
 * ===================================================
 */

// =========== STRIPE CREDENTIALS SHOULD BE IN .env FILE ===========
// This is only a fallback - DO NOT add your real keys here
const stripeCredentials = {
  // These should be loaded from .env file - DO NOT add real keys here
  secretKey: 'YOUR_STRIPE_SECRET_KEY', // Do NOT put real key here - use .env file
  publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY', // Do NOT put real key here - use .env file
  webhookSecret: 'YOUR_STRIPE_WEBHOOK_SECRET', // Optional: for webhook verification
  useFallbackMode: false // Set to false to use real Stripe API calls
};

// Export a function to set environment variables
function setupEnvironmentVariables() {
  // Check for the .env file and load variables from it
  const dotenv = require('dotenv');
  dotenv.config(); // Load .env file variables
  
  // Only use placeholder values if .env doesn't have the values
  if (!process.env.STRIPE_SECRET_KEY) {
    process.env.STRIPE_SECRET_KEY = stripeCredentials.secretKey;
    console.log('Manually set STRIPE_SECRET_KEY');
  } else {
    console.log('Using STRIPE_SECRET_KEY from .env file');
  }
  
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    process.env.STRIPE_PUBLISHABLE_KEY = stripeCredentials.publishableKey;
    console.log('Manually set STRIPE_PUBLISHABLE_KEY');
  } else {
    console.log('Using STRIPE_PUBLISHABLE_KEY from .env file');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET && stripeCredentials.webhookSecret) {
    process.env.STRIPE_WEBHOOK_SECRET = stripeCredentials.webhookSecret;
    console.log('Manually set STRIPE_WEBHOOK_SECRET');
  } else if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('Using STRIPE_WEBHOOK_SECRET from .env file');
  }
  
  if (process.env.USE_FALLBACK_MODE === undefined) {
    process.env.USE_FALLBACK_MODE = stripeCredentials.useFallbackMode.toString();
    console.log('Manually set USE_FALLBACK_MODE to', stripeCredentials.useFallbackMode);
  } else {
    console.log('Using USE_FALLBACK_MODE from .env file:', process.env.USE_FALLBACK_MODE);
  }
  
  // Return the values that were set
  return {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'set' : 'not set',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? 'set' : 'not set',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'set' : 'not set',
    useFallbackMode: process.env.USE_FALLBACK_MODE === 'true'
  };
}

module.exports = {
  setupEnvironmentVariables
};

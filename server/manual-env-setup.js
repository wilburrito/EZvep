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
  
  // Check if env variables exist and are not placeholder values
  const hasRealSecretKey = process.env.STRIPE_SECRET_KEY && 
    !process.env.STRIPE_SECRET_KEY.includes('YOUR_') && 
    process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here';
    
  const hasRealPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY && 
    !process.env.STRIPE_PUBLISHABLE_KEY.includes('YOUR_') && 
    process.env.STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_stripe_publishable_key_here';
  
  const hasRealWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET && 
    !process.env.STRIPE_WEBHOOK_SECRET.includes('YOUR_') && 
    process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_your_stripe_webhook_secret_here';
  
  // Only use placeholder values if .env doesn't have real values
  if (!hasRealSecretKey) {
    console.log('WARNING: No valid STRIPE_SECRET_KEY found in environment. This will cause errors.');
    console.log('Please add a valid STRIPE_SECRET_KEY to your .env file.');
  } else {
    console.log('Using STRIPE_SECRET_KEY from .env file');
    // Log the first few and last few characters for verification
    const key = process.env.STRIPE_SECRET_KEY;
    console.log(`Key format: ${key.substring(0, 8)}...${key.substring(key.length - 5)}`);
  }
  
  if (!hasRealPublishableKey) {
    console.log('WARNING: No valid STRIPE_PUBLISHABLE_KEY found in environment. This will cause errors.');
    console.log('Please add a valid STRIPE_PUBLISHABLE_KEY to your .env file.');
  } else {
    console.log('Using STRIPE_PUBLISHABLE_KEY from .env file');
  }
  
  if (!hasRealWebhookSecret) {
    console.log('WARNING: No valid STRIPE_WEBHOOK_SECRET found in environment.');
    console.log('Webhook signature verification will fail without this key.');
  } else {
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

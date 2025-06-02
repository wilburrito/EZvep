/**
 * Production Environment Setup for EZVEP Stripe Integration
 * 
 * This script helps configure the necessary environment variables for production.
 * IMPORTANT: Do not commit this file with actual production keys.
 */

console.log('=== EZVEP Stripe Production Setup ===');
console.log('Instructions for setting up Stripe in production:');
console.log('1. Create a .env.production file in the server directory');
console.log('2. Add the following variables with your production keys:');
console.log(`
# Stripe Configuration (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
USE_FALLBACK_MODE=false

# Server Configuration
PORT=3001
NODE_ENV=production

# Other Variables (copy from development)
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=...
`);

console.log('\nPRODUCTION CHECKLIST:');
console.log('✓ Ensure production Stripe API keys are set (not test keys)');
console.log('✓ Configure a proper webhook endpoint in Stripe dashboard');
console.log('✓ Set up proper CORS for your production domain');
console.log('✓ Consider implementing rate limiting for API endpoints');
console.log('✓ Set up proper logging and monitoring');
console.log('✓ Update success/cancel URLs to use production domain');
console.log('✓ Remove or secure test endpoints in production');

console.log('\nTo start the server in production mode:');
console.log('NODE_ENV=production node index.js');

// Function to verify production configuration
function verifyProductionConfig() {
  try {
    // Check if production environment variables are set
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    // Check if Stripe keys appear to be production keys
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      throw new Error('Using test secret key in production environment');
    }
    
    if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
      throw new Error('Using test publishable key in production environment');
    }
    
    return {
      success: true,
      message: 'Production configuration verified!'
    };
  } catch (error) {
    return {
      success: false,
      message: `Production configuration error: ${error.message}`
    };
  }
}

module.exports = { verifyProductionConfig };

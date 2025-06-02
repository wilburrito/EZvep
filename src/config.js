/**
 * Application Configuration
 * 
 * This file centralizes all configuration settings for the application.
 * It detects the current environment and sets appropriate configuration values.
 */

// Determine if we're in production by checking the hostname
const isProduction = 
  typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

// API URLs - ensure local uses HTTP and for production we use relative URLs
const LOCAL_API_URL = 'http://localhost:3001'; // Always use HTTP for localhost
// For production, use relative URLs to avoid cross-origin issues
const PRODUCTION_API_URL = ''; // Empty string means use relative URLs

// Export environment-specific configuration
const config = {
  // API Configuration
  api: {
    baseUrl: isProduction ? PRODUCTION_API_URL : LOCAL_API_URL,
    endpoints: {
      // Primary endpoint for creating checkout sessions
      createCheckoutSession: '/direct-api/create-checkout-session',
      // Legacy endpoint for backwards compatibility
      legacyCreateCheckoutSession: '/api/create-checkout-session',
      // Endpoint for verifying payment status
      verifyPayment: '/api/payment-status',
    }
  },

  // Feature flags
  features: {
    useStripeLiveMode: isProduction
  }
};

export default config;

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

// API base URL configuration
const LOCAL_API_URL = 'http://localhost:3001';
const PRODUCTION_API_URL = 'https://www.ezvep.com'; // Replace with your actual backend URL

// Export environment-specific configuration
const config = {
  // API Configuration
  api: {
    baseUrl: isProduction ? PRODUCTION_API_URL : LOCAL_API_URL,
    endpoints: {
      createCheckoutSession: '/api/create-checkout-session',
      paymentStatus: '/api/payment-status',
      webhook: '/webhook'
    }
  },

  // Feature flags
  features: {
    useStripeLiveMode: isProduction
  }
};

export default config;

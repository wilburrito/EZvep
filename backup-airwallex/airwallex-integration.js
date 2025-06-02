// Airwallex integration helpers
const Airwallex = require('airwallex');

/**
 * Initialize the Airwallex SDK with credentials from environment variables
 * @returns {Object|null} Initialized Airwallex SDK instance or null if credentials missing
 */
function initializeAirwallex() {
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const env = process.env.AIRWALLEX_ENV || 'demo';
  
  if (!apiKey || !clientId) {
    console.log('Missing Airwallex credentials - cannot initialize SDK');
    return null;
  }
  
  try {
    console.log(`Initializing Airwallex SDK with Client ID: ${clientId.substring(0, 5)}...`);
    
    const airwallex = new Airwallex({
      clientId: clientId,
      clientSecret: apiKey, // API Key should be passed as clientSecret
      environment: env === 'prod' ? 'production' : 'demo'
    });
    
    console.log('Airwallex SDK initialized successfully');
    return airwallex;
  } catch (error) {
    console.error('Error initializing Airwallex SDK:', error.message);
    return null;
  }
}

/**
 * Create a payment intent using the Airwallex SDK
 * @param {Object} airwallex - Initialized Airwallex SDK instance
 * @param {Object} payload - Payment intent data
 * @returns {Promise<Object>} Payment intent data
 */
async function createPaymentIntent(airwallex, payload) {
  if (!airwallex) {
    throw new Error('Airwallex SDK not initialized');
  }
  
  console.log('Creating payment intent with payload:', JSON.stringify(payload, null, 2));
  
  try {
    const paymentIntent = await airwallex.execute({
      method: 'post',
      url: '/api/v1/pa/payment_intents/create',
      body: payload
    });
    
    console.log('Payment intent created successfully:', JSON.stringify(paymentIntent, null, 2));
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Retrieve a payment intent using the Airwallex SDK
 * @param {Object} airwallex - Initialized Airwallex SDK instance
 * @param {string} paymentIntentId - Payment intent ID to retrieve
 * @returns {Promise<Object>} Payment intent data
 */
async function getPaymentIntent(airwallex, paymentIntentId) {
  if (!airwallex) {
    throw new Error('Airwallex SDK not initialized');
  }
  
  try {
    const paymentIntent = await airwallex.execute({
      method: 'get',
      url: `/api/v1/pa/payment_intents/${paymentIntentId}`
    });
    
    console.log('Payment intent retrieved:', JSON.stringify(paymentIntent, null, 2));
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error.message);
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Create a mock payment intent for testing/fallback purposes
 * @param {Object} data - Mock payment intent data
 * @returns {Object} Mock payment intent
 */
function createMockPaymentIntent(data = {}) {
  const { amount = 10, currency = 'SGD', customerInfo = {} } = data;
  
  // Generate a random ID for the mock payment intent
  const id = `mock_intent_${Date.now()}`;
  const clientSecret = `mock_secret_${Date.now()}`;
  
  console.log('Creating mock payment intent:', id);
  
  return {
    id,
    client_secret: clientSecret,
    amount,
    currency,
    status: 'SUCCEEDED',
    customer_info: customerInfo,
    created_at: new Date().toISOString(),
    return_url: 'http://localhost:3000/payment-success',
    isMock: true
  };
}

module.exports = {
  initializeAirwallex,
  createPaymentIntent,
  getPaymentIntent,
  createMockPaymentIntent
};

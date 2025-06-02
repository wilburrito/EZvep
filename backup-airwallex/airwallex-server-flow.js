/**
 * Airwallex Server-Side Payment Flow
 * 
 * This module provides functionality for generating direct payment URLs
 * without requiring the client-side Airwallex SDK.
 */
const crypto = require('crypto');

/**
 * Creates a direct payment URL using the Airwallex API
 * 
 * @param {Object} airwallex - Initialized Airwallex SDK instance
 * @param {Object} paymentDetails - Customer and payment details
 * @returns {Promise<string>} Direct payment URL
 */
async function createDirectPaymentUrl(airwallex, paymentDetails) {
  try {
    // Generate unique IDs for the order and request
    const orderID = paymentDetails.orderId || `order_${crypto.randomBytes(8).toString('hex')}`;
    const requestID = `req_${crypto.randomBytes(8).toString('hex')}`;
    
    // Format amount to 2 decimal places
    const amount = parseFloat(paymentDetails.amount || 0).toFixed(2);
    
    // Configure the redirect URL to return to the frontend after payment
    const returnUrl = paymentDetails.returnUrl || 'http://localhost:3000/payment-success';
    
    // Define the payment intent payload
    const payload = {
      amount: parseFloat(amount),
      currency: paymentDetails.currency || 'SGD',
      merchant_order_id: orderID,
      descriptor: paymentDetails.descriptor || 'EZVEP Purchase',
      return_url: returnUrl,
      expired_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      metadata: {
        customer_name: paymentDetails.customerName || 'Guest',
        customer_email: paymentDetails.customerEmail || '',
        ...paymentDetails.metadata
      },
      request_id: requestID
    };
    
    console.log('Creating payment intent with payload:', JSON.stringify(payload, null, 2));
    
    // Create the payment intent
    let paymentIntent;
    try {
      paymentIntent = await airwallex.execute({
        method: 'post',
        url: '/api/v1/pa/payment_intents/create',
        body: payload
      });
      console.log('Payment intent created successfully with ID:', paymentIntent.id);
      console.log('Payment intent details:', JSON.stringify(paymentIntent, null, 2));
    } catch (apiError) {
      console.error('Error in Airwallex API call:', apiError);
      if (apiError.response) {
        console.error('API response error data:', apiError.response.data);
      }
      throw apiError;
    }
    
    // Instead of using Airwallex's hosted page directly, use our custom payment page
    console.log('Using custom payment page for better reliability...');
    
    // Import the custom payment URL creator function
    const { createCustomPaymentUrl } = require('./custom-payment-handler');
    
    // Create a custom payment URL with all the necessary parameters
    const customPaymentUrl = createCustomPaymentUrl({
      intentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: payload.amount,
      currency: payload.currency,
      orderId: orderID,
      returnUrl: returnUrl
    });
    
    console.log('Generated custom payment URL:', customPaymentUrl);
    return customPaymentUrl;
  } catch (error) {
    console.error('Error creating direct payment URL:', error.message);
    throw error;
  }
}

/**
 * Creates a mock payment URL for testing when Airwallex is not available
 * 
 * @param {Object} paymentDetails - Customer and payment details
 * @returns {string} Mock payment URL
 */
function createMockPaymentUrl(paymentDetails) {
  const mockParams = new URLSearchParams({
    amount: paymentDetails.amount || '47.00',
    currency: paymentDetails.currency || 'SGD',
    orderId: paymentDetails.orderId || `mock_order_${Date.now()}`,
    customerName: paymentDetails.customerName || 'Test Customer',
    returnUrl: paymentDetails.returnUrl || 'http://localhost:3000/payment-success'
  });
  
  // Use the current server port instead of hardcoded 5000
  const serverPort = process.env.PORT || 3001;
  return `http://localhost:${serverPort}/mock-payment?${mockParams.toString()}`;
}

module.exports = {
  createDirectPaymentUrl,
  createMockPaymentUrl
};

/**
 * Stripe Mock Payment Integration
 * 
 * This provides a fallback mechanism for testing when Stripe is not available
 * or when in development mode.
 */

/**
 * Creates a mock checkout session URL for testing
 * 
 * @param {Object} paymentDetails - Customer and payment details
 * @returns {Object} Mock checkout session object
 */
function createMockCheckoutSession(paymentDetails) {
  // Generate a random session ID
  const sessionId = `cs_test_mock_${Date.now()}`;
  
  // Format amount 
  const amount = parseFloat(paymentDetails.amount || 0).toFixed(2);
  const currency = paymentDetails.currency || 'SGD';
  
  // Get server port for the mock payment URL
  const port = process.env.PORT || 3001;
  
  // Create mock checkout URL that points to our success page - includes success/cancel URLs as params
  const mockUrl = `http://localhost:${port}/mock-payment?sessionId=${sessionId}&amount=${amount}&currency=${currency}`;
  
  // Note: We're not using success/cancel URLs directly in the mock URL to keep it simple
  // In a real implementation, these would be passed to Stripe
  
  console.log('Created mock checkout session:', mockUrl);
  
  return {
    url: mockUrl,
    sessionId: sessionId
  };
}

/**
 * Verifies a mock payment status
 * 
 * @param {string} sessionId - The session ID to verify
 * @returns {Object} Mock payment status
 */
function verifyMockPayment(sessionId) {
  // In a real implementation, you would look up the session in a database
  // For mock purposes, we'll just return a successful status
  return {
    status: 'paid',
    customer: {
      name: 'Test Customer',
      email: 'test@example.com'
    },
    amount: 47.00,
    currency: 'SGD',
    paymentIntent: `pi_mock_${Date.now()}`
  };
}

module.exports = {
  createMockCheckoutSession,
  verifyMockPayment
};

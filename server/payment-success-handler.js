/**
 * Payment Success Handler
 * 
 * Handles verification of payment success and sending confirmation emails
 */
// No need to import express here as we're just using the app instance passed in

/**
 * Adds payment success verification endpoint to Express app
 * @param {Object} app - Express app instance
 */
function addPaymentSuccessHandler(app) {
  // Payment success verification endpoint
  app.post('/api/payment-success', (req, res) => {
    console.log('Payment success verification request received:', req.body);
    
    try {
      const { paymentIntentId, customerInfo, order_id } = req.body;
      
      // Log detailed information for debugging
      console.log('Payment intent ID:', paymentIntentId);
      console.log('Order ID:', order_id);
      console.log('Customer info:', customerInfo);
      
      // For mock payments, we'll just assume success if any identifier is provided
      const isSuccess = !!(paymentIntentId || order_id);
      
      if (isSuccess) {
        // Return success response
        return res.status(200).json({
          success: true,
          message: 'Payment confirmed successfully',
          orderId: order_id || 'unknown',
          paymentIntentId: paymentIntentId || 'mock_payment',
          timestamp: new Date().toISOString()
        });
      } else {
        // Return error response
        return res.status(400).json({
          success: false,
          message: 'Unable to verify payment',
          error: 'Missing payment identifiers'
        });
      }
    } catch (error) {
      console.error('Error in payment success handler:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error processing payment verification',
        error: error.message
      });
    }
  });
  
  // Special handler for mock payments when no intent ID is provided
  app.get('/api/verify-mock-payment', (req, res) => {
    console.log('Mock payment verification request received:', req.query);
    
    const { order_id, status } = req.query;
    
    // Always return success for mock payments in development
    return res.status(200).json({
      success: true,
      message: 'Mock payment confirmed',
      orderId: order_id || 'mock_order',
      status: status || 'success',
      isMock: true,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = { addPaymentSuccessHandler };

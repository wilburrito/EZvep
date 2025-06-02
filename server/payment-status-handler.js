/**
 * Payment Status Verification Handler
 * 
 * This module provides a route to verify the status of a payment
 * using the Airwallex API or returns mock data for testing.
 */
const { initializeAirwallex } = require('./airwallex-integration');

/**
 * Adds a payment status verification route to the Express app
 * @param {Object} app - Express application
 */
function addPaymentStatusHandler(app) {
  // Payment status verification endpoint
  app.get('/api/payment-status', async (req, res) => {
    console.log('Payment status verification request received for ID:', req.query.id);

    try {
      const paymentIntentId = req.query.id;
      
      if (!paymentIntentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment intent ID is required' 
        });
      }
      
      // Initialize Airwallex SDK
      const airwallex = initializeAirwallex();
      const useFallbackMode = process.env.USE_FALLBACK_MODE === 'true';
      
      // If Airwallex is available and fallback mode is not enabled, verify with API
      if (airwallex && !useFallbackMode) {
        try {
          console.log('Verifying payment status with Airwallex API for ID:', paymentIntentId);
          
          // Retrieve payment intent details from Airwallex
          const paymentIntent = await airwallex.execute({
            method: 'get',
            url: `/api/v1/pa/payment_intents/${paymentIntentId}`
          });
          
          return res.status(200).json({
            success: true,
            paymentIntent: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency
            },
            message: 'Payment status retrieved successfully'
          });
        } catch (airwallexError) {
          console.error('Error verifying payment with Airwallex:', airwallexError.message);
          
          // If verification fails, return mock data
          return res.status(200).json({
            success: true,
            paymentIntent: {
              id: paymentIntentId,
              status: 'SUCCEEDED',
              amount: 2999,
              currency: 'SGD'
            },
            fallback: true,
            error: airwallexError.message,
            message: 'Fallback to mock payment status due to Airwallex error'
          });
        }
      } else {
        // Use mock data if Airwallex is not available or fallback mode is enabled
        console.log('Using mock payment status (fallback mode or Airwallex not available)');
        
        return res.status(200).json({
          success: true,
          paymentIntent: {
            id: paymentIntentId,
            status: 'SUCCEEDED',
            amount: 2999,
            currency: 'SGD'
          },
          fallback: true,
          error: airwallex ? 'Fallback mode enabled' : 'Airwallex not initialized',
          message: 'Mock payment status created successfully'
        });
      }
    } catch (error) {
      console.error('Error in payment status verification route:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error: ' + error.message 
      });
    }
  });
}

module.exports = {
  addPaymentStatusHandler
};

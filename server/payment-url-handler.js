/**
 * Payment URL Creation Handler
 * 
 * This module provides a route to create payment URLs using either
 * Airwallex direct payment or mock payment as fallback.
 */
const { initializeAirwallex } = require('./airwallex-integration');
const { createDirectPaymentUrl, createMockPaymentUrl } = require('./airwallex-server-flow');

/**
 * Adds a payment URL creation route to the Express app
 * @param {Object} app - Express application
 */
function addPaymentUrlRoute(app) {
  // Payment URL creation endpoint
  app.post('/api/create-payment-url', async (req, res) => {
    console.log('Payment URL creation request received:', req.body);

    try {
      const { amount, currency, customerInfo } = req.body;
      
      if (!amount || !currency) {
        return res.status(400).json({ 
          success: false, 
          message: 'Amount and currency are required' 
        });
      }
      
      // Initialize Airwallex SDK
      const airwallex = initializeAirwallex();
      const useFallbackMode = process.env.USE_FALLBACK_MODE === 'true';
      
      // If Airwallex is available and fallback mode is not enabled, use direct payment
      if (airwallex && !useFallbackMode) {
        try {
          // Format payment details
          const paymentDetails = {
            amount,
            currency,
            customerName: customerInfo?.name || 'Test Customer',
            customerEmail: customerInfo?.email || '',
            orderId: `order_${Date.now()}`,
            returnUrl: 'http://localhost:3000/payment-success'
          };
          
          console.log('Creating direct payment URL with Airwallex...');
          const paymentUrl = await createDirectPaymentUrl(airwallex, paymentDetails);
          
          return res.status(200).json({
            success: true,
            paymentUrl,
            orderId: paymentDetails.orderId,
            fallback: false,
            message: 'Direct payment URL created successfully'
          });
        } catch (airwallexError) {
          console.error('Error creating direct payment URL:', airwallexError.message);
          
          // If direct payment fails, fallback to mock payment
          const mockPaymentUrl = createMockPaymentUrl({
            amount,
            currency,
            customerName: customerInfo?.name || 'Test Customer',
            orderId: `mock_order_${Date.now()}`,
            returnUrl: 'http://localhost:3000/payment-success'
          });
          
          return res.status(200).json({
            success: true,
            paymentUrl: mockPaymentUrl,
            fallback: true,
            error: airwallexError.message,
            message: 'Fallback to mock payment URL due to Airwallex error'
          });
        }
      } else {
        // Use mock payment if Airwallex is not available or fallback mode is enabled
        console.log('Using mock payment URL (fallback mode or Airwallex not available)');
        const mockPaymentUrl = createMockPaymentUrl({
          amount,
          currency,
          customerName: customerInfo?.name || 'Test Customer',
          orderId: `mock_order_${Date.now()}`,
          returnUrl: 'http://localhost:3000/payment-success'
        });
        
        return res.status(200).json({
          success: true,
          paymentUrl: mockPaymentUrl,
          fallback: true,
          error: airwallex ? 'Fallback mode enabled' : 'Airwallex not initialized',
          message: 'Mock payment URL created successfully'
        });
      }
    } catch (error) {
      console.error('Error in payment URL creation route:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error: ' + error.message 
      });
    }
  });
}

module.exports = {
  addPaymentUrlRoute
};

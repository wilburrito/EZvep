/**
 * Direct Payment Redirect Route
 * 
 * A simpler, more direct route to handle payment redirection with minimal dependencies
 */
const express = require('express');
const crypto = require('crypto');

/**
 * Adds a direct payment redirect route to Express app
 * @param {Object} app - Express app instance
 */
function addDirectPaymentRoute(app) {
  // Direct payment route with minimal overhead
  app.post('/direct-payment', express.json(), (req, res) => {
    console.log('Direct payment request received');
    
    try {
      const { amount, currency, customerInfo } = req.body;
      
      if (!amount || !currency) {
        return res.status(400).json({ success: false, message: 'Amount and currency are required' });
      }
      
      // Generate order ID
      const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      
      // Create mock payment URL with all parameters in query string
      const mockParams = new URLSearchParams({
        amount: amount || '47.00',
        currency: currency || 'SGD',
        orderId: orderId,
        customerName: customerInfo?.name || 'Test Customer',
        returnUrl: 'http://localhost:3000/payment-success'
      });
      
      const paymentUrl = `http://localhost:5000/mock-payment?${mockParams.toString()}`;
      
      // Return success with the payment URL
      return res.status(200).json({
        success: true,
        paymentUrl,
        orderId,
        message: 'Payment URL created successfully'
      });
    } catch (error) {
      console.error('Error in direct payment route:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  // Mock payment page with simplified interface
  app.get('/mock-payment', (req, res) => {
    const { amount, currency, orderId, customerName, returnUrl } = req.query;
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Simplified Payment Page</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
          .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
          h1, h2 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Simplified Payment Page</h1>
        <div class="card">
          <h2>Order Details</h2>
          <p><strong>Amount:</strong> ${amount || '47.00'} ${currency || 'SGD'}</p>
          <p><strong>Order ID:</strong> ${orderId || 'test_order'}</p>
          <p><strong>Customer:</strong> ${customerName || 'Test Customer'}</p>
          
          <button onclick="simulateSuccessfulPayment()">
            Simulate Successful Payment
          </button>
          <button onclick="simulateFailedPayment()" style="background: #f44336;">
            Simulate Failed Payment
          </button>
          
          <script>
            function simulateSuccessfulPayment() {
              // Create payment data for successful payment
              const paymentData = {
                status: 'success',
                order_id: '${orderId || "test_order"}',
                payment_intent_id: 'mock_intent_' + Date.now() + '_success'
              };
              
              // Properly format the redirect URL with query parameters
              const returnUrl = '${returnUrl || "http://localhost:3000/payment-success"}';
              const queryParams = new URLSearchParams(paymentData).toString();
              const redirectUrl = returnUrl + '?' + queryParams;
              
              console.log('Redirecting to:', redirectUrl);
              window.location.href = redirectUrl;
            }
            
            function simulateFailedPayment() {
              // Create payment data for failed payment
              const paymentData = {
                status: 'failed',
                order_id: '${orderId || "test_order"}',
                error_code: 'payment_failed',
                error_message: 'This is a simulated payment failure'
              };
              
              // Properly format the redirect URL with query parameters
              const returnUrl = '${returnUrl || "http://localhost:3000/payment-success"}';
              const queryParams = new URLSearchParams(paymentData).toString();
              const redirectUrl = returnUrl + '?' + queryParams;
              
              console.log('Redirecting to:', redirectUrl);
              window.location.href = redirectUrl;
            }
          </script>
        </div>
      </body>
      </html>
    `);
  });
}

module.exports = { addDirectPaymentRoute };

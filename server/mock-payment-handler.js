/**
 * Mock Payment Handler
 * 
 * This module provides routes for handling mock payments when Airwallex is not available
 * or in fallback mode.
 */

/**
 * Adds mock payment routes to the Express app
 * @param {Object} app - Express application
 */
function addMockPaymentRoutes(app) {
  // Serve the mock payment page
  app.get('/mock-payment', (req, res) => {
    const { amount, currency, orderId, customerName, returnUrl } = req.query;
    
    console.log('Serving mock payment page with params:', req.query);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Payment Page</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.5;
          }
          .payment-details {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .payment-details div {
            margin-bottom: 10px;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
          }
          button:hover {
            background-color: #45a049;
          }
          .cancel {
            background-color: #f44336;
            margin-top: 10px;
          }
          .cancel:hover {
            background-color: #da190b;
          }
        </style>
      </head>
      <body>
        <h1>Mock Payment</h1>
        <p>This is a simulated payment page for testing purposes.</p>
        
        <div class="payment-details">
          <div><strong>Order ID:</strong> ${orderId || 'Unknown'}</div>
          <div><strong>Amount:</strong> ${amount || '0.00'} ${currency || 'SGD'}</div>
          <div><strong>Customer:</strong> ${customerName || 'Unknown'}</div>
        </div>
        
        <button onclick="simulateSuccessfulPayment()">Complete Payment</button>
        <button class="cancel" onclick="simulateFailedPayment()">Cancel Payment</button>
        
        <script>
          function simulateSuccessfulPayment() {
            // Simulate payment processing
            document.body.innerHTML += '<p>Processing payment...</p>';
            
            // Redirect to success URL after a short delay
            setTimeout(() => {
              const returnUrl = '${returnUrl || "http://localhost:3000/payment-success"}';
              const urlWithParams = new URL(returnUrl);
              urlWithParams.searchParams.append('status', 'success');
              urlWithParams.searchParams.append('order_id', '${orderId || "mock_order"}');
              window.location.href = urlWithParams.toString();
            }, 1500);
          }
          
          function simulateFailedPayment() {
            // Redirect to success URL with failure status
            const returnUrl = '${returnUrl || "http://localhost:3000/payment-success"}';
            const urlWithParams = new URL(returnUrl);
            urlWithParams.searchParams.append('status', 'cancelled');
            urlWithParams.searchParams.append('order_id', '${orderId || "mock_order"}');
            window.location.href = urlWithParams.toString();
          }
        </script>
      </body>
      </html>
    `);
  });
}

module.exports = {
  addMockPaymentRoutes
};

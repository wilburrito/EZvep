/**
 * Stripe Routes
 * 
 * This module provides Express routes for Stripe payment testing and mocks
 */
const path = require('path');
const { createMockCheckoutSession, verifyMockPayment } = require('./stripe-integration');

/**
 * Registers Stripe test routes with Express
 * 
 * @param {Object} app - Express application
 */
function addStripeRoutes(app) {
  // Serve the Stripe test page
  app.get('/stripe-test', (req, res) => {
    const filePath = path.join(__dirname, 'stripe-test.html');
    res.sendFile(filePath);
  });
  
  // Serve the mock payment page
  app.get('/mock-payment', (req, res) => {
    const filePath = path.join(__dirname, 'mock-payment.html');
    res.sendFile(filePath);
  });
  
  // Create a mock payment session (for fallback mode)
  app.post('/api/mock-checkout-session', (req, res) => {
    try {
      console.log('Creating mock checkout session:', req.body);
      const mockSession = createMockCheckoutSession(req.body);
      res.json(mockSession);
    } catch (error) {
      console.error('Error creating mock checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Verify a mock payment
  app.get('/api/mock-payment-status', (req, res) => {
    try {
      const { sessionId } = req.query;
      console.log('Verifying mock payment status for session:', sessionId);
      const status = verifyMockPayment(sessionId);
      res.json(status);
    } catch (error) {
      console.error('Error verifying mock payment:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Simple payment success page
  app.get('/payment-success', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Success</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f5f7fa;
            }
            .success-card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              color: #22c55e;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            .details {
              margin: 30px 0;
              text-align: left;
              padding: 20px;
              background: #f0fdf4;
              border-radius: 8px;
            }
            .btn {
              background: #4f46e5;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              font-size: 16px;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="success-card">
            <div class="icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Your payment has been processed successfully. Thank you for your purchase!</p>
            
            <div class="details">
              <p><strong>Session ID:</strong> ${req.query.session_id || 'Not provided'}</p>
            </div>
            
            <a href="/" class="btn">Return to Home</a>
          </div>
        </body>
      </html>
    `);
  });
  
  // Simple payment cancel page
  app.get('/payment-cancel', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Cancelled</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f5f7fa;
            }
            .cancel-card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              color: #ef4444;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            .btn {
              background: #4f46e5;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              font-size: 16px;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="cancel-card">
            <div class="icon">❌</div>
            <h1>Payment Cancelled</h1>
            <p>Your payment was cancelled. No charges were made to your account.</p>
            
            <a href="/" class="btn">Return to Home</a>
          </div>
        </body>
      </html>
    `);
  });
  
  console.log('Stripe test routes registered');
}

module.exports = {
  addStripeRoutes
};

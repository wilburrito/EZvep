/**
 * Payment URL Creation Endpoint
 * 
 * This file contains the Express route handler for creating server-side payment URLs.
 * It should be imported and used in the main server file.
 */
const express = require('express');
const { createDirectPaymentUrl, createMockPaymentUrl } = require('./airwallex-server-flow');
const { initializeAirwallex } = require('./airwallex-integration');

/**
 * Adds the payment URL creation endpoint to an Express app
 * @param {Object} app - Express app instance
 */
function addPaymentUrlEndpoint(app) {
  // Add endpoint for creating server-side payment URL
  app.post('/api/create-payment-url', async (req, res) => {
    console.log('Payment URL request received');
    try {
      // Get the request data
      const { amount, currency, customerInfo } = req.body;
      const name = customerInfo?.name || '';
      const email = customerInfo?.email || '';
      
      console.log(`Payment URL requested: ${amount} ${currency} for ${name}`);
      
      if (!amount || !currency) {
        return res.status(400).json({ success: false, message: 'Amount and currency are required' });
      }
      
      // IMPORTANT: Check if we should use fallback mode first
      const useFallbackMode = process.env.USE_FALLBACK_MODE === 'true';
      console.log('Use fallback mode decision:', useFallbackMode);
      
      if (useFallbackMode) {
        console.log('Using fallback mode for payment URL (environment variable set)');
        const mockUrl = createMockPaymentUrl({
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success'
        });
        
        return res.status(200).json({ success: true, paymentUrl: mockUrl });
      }
      
      // Initialize the Airwallex SDK
      const airwallex = initializeAirwallex();
      
      if (!airwallex) {
        console.log('Failed to initialize Airwallex SDK - using fallback mode');
        const mockUrl = createMockPaymentUrl({
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success'
        });
        
        return res.status(200).json({ success: true, paymentUrl: mockUrl });
      }
      
      try {
        // Create a direct payment URL using our helper function
        const paymentUrl = await createDirectPaymentUrl(airwallex, {
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success',
          items: [
            {
              name: 'DIY VEP E-Guide',
              quantity: 1,
              price: amount,
              currency: currency,
              sku: 'EZVEP-GUIDE-01'
            }
          ]
        });
        
        console.log(`Direct payment URL created: ${paymentUrl}`);
        
        return res.status(200).json({ success: true, paymentUrl });
      } catch (error) {
        console.error('Error creating direct payment URL:', error.message);
        
        // Fall back to mock payment if the real one fails
        const mockUrl = createMockPaymentUrl({
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success'
        });
        
        return res.status(200).json({ 
          success: true, 
          paymentUrl: mockUrl,
          fallback: true,
          error: error.message 
        });
      }
    } catch (error) {
      console.error('Server error creating payment URL:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to create payment URL' });
    }
  });
  
  // Add a form submission handler that supports URL-encoded form data
  // Register the URL-encoded parser middleware at the app level
  app.use(express.urlencoded({ extended: true }));
  
  // Handle form submissions
  app.post('/api/create-payment-form', async (req, res) => {
    console.log('Form submission received');
    console.log('Form data:', req.body);
    try {
      const { amount, currency, name, email } = req.body;
      
      console.log(`Payment form submission: ${amount} ${currency} for ${name}`);
      
      if (!amount || !currency) {
        return res.status(400).json({ success: false, message: 'Amount and currency are required' });
      }
      
      // Initialize the Airwallex SDK
      const airwallex = initializeAirwallex();
      
      // Check if fallback mode or SDK initialization failed
      if (process.env.USE_FALLBACK_MODE === 'true' || !airwallex) {
        console.log('Using fallback mode for payment form');
        const mockUrl = createMockPaymentUrl({
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success'
        });
        
        return res.redirect(mockUrl);
      }
      
      try {
        // Create a direct payment URL
        const paymentUrl = await createDirectPaymentUrl(airwallex, {
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success',
          items: [
            {
              name: 'DIY VEP E-Guide',
              quantity: 1,
              price: amount,
              currency: currency,
              sku: 'EZVEP-GUIDE-01'
            }
          ]
        });
        
        console.log(`Direct payment URL created from form: ${paymentUrl}`);
        
        // Redirect to the payment URL
        return res.redirect(paymentUrl);
      } catch (error) {
        console.error('Error creating direct payment URL from form:', error.message);
        
        // Fall back to mock payment
        const mockUrl = createMockPaymentUrl({
          amount,
          currency,
          customerName: name,
          customerEmail: email,
          returnUrl: 'http://localhost:3000/payment-success'
        });
        
        return res.redirect(mockUrl);
      }
    } catch (error) {
      console.error('Server error processing payment form:', error.message);
      return res.status(500).send('An error occurred while processing your payment. Please try again.');
    }
  });
  
  // Add a simple test page endpoint
  app.get('/server-payment-test', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server-Side Payment Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
          .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1, h2 { color: #333; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Server-Side Payment Test</h1>
        <p>This page tests the Airwallex payment flow without using the client-side SDK.</p>
        
        <div class="card">
          <h2>Create Payment</h2>
          <p>Click the button below to initiate a test payment:</p>
          <!-- Direct form submission with proper debugging -->
          <form action="http://localhost:5000/api/create-payment-form" method="POST" enctype="application/x-www-form-urlencoded">
            <input type="hidden" name="amount" value="1.00">
            <input type="hidden" name="currency" value="SGD">
            <input type="hidden" name="name" value="Test Customer">
            <input type="hidden" name="email" value="test@example.com">
            <button type="submit" onclick="console.log('Form submitted')">Create $1.00 Test Payment</button>
            <p><small>This will submit a form with: amount=1.00, currency=SGD</small></p>
          </form>
        </div>
        
        <div class="card">
          <h2>Documentation</h2>
          <p>To use this server-side payment flow in your frontend code:</p>
          <pre>
// Replace client-side SDK with a direct fetch request
const response = await fetch('/api/create-payment-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1.00,
    currency: 'SGD',
    customerInfo: {
      name: 'Customer Name',
      email: 'customer@example.com'
    }
  })
});

const { success, paymentUrl } = await response.json();

// Redirect to the payment URL
if (success && paymentUrl) {
  window.location.href = paymentUrl;
}
          </pre>
        </div>
      </body>
      </html>
    `);
  });
  
  // Add a mock payment page endpoint
  app.get('/mock-payment', (req, res) => {
    const { amount, currency, orderId, customerName, returnUrl } = req.query;
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Payment Page</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
          .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
          .success { background: #52c41a; }
          .error { background: #f5222d; }
          h1, h2 { color: #333; }
          .detail { text-align: left; margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Mock Payment Page</h1>
        <div class="card">
          <h2>Order Details</h2>
          <p><strong>Amount:</strong> ${amount || '1.00'} ${currency || 'SGD'}</p>
          <p><strong>Order ID:</strong> ${orderId || 'mock_order'}</p>
          <p><strong>Customer:</strong> ${customerName || 'Test Customer'}</p>
          
          <div class="detail">
            <p>This is a mock payment page for development testing.</p>
            <p>In a real implementation, users would enter their card details here.</p>
          </div>
          
          <button class="success" onclick="window.location.href='${returnUrl || '/payment-result'}?status=success&order_id=${orderId || 'mock_order'}'">
            Simulate Successful Payment
          </button>
          
          <button class="error" onclick="window.location.href='${returnUrl || '/payment-result'}?status=failed&order_id=${orderId || 'mock_order'}'">
            Simulate Failed Payment
          </button>
        </div>
      </body>
      </html>
    `);
  });
  
  // Add a payment result page endpoint
  app.get('/payment-result', (req, res) => {
    const { status, order_id } = req.query;
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Result</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
          .success { color: #52c41a; }
          .error { color: #f5222d; }
          .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1 class="${status === 'success' ? 'success' : 'error'}">
            ${status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </h1>
          <p><strong>Order ID:</strong> ${order_id || 'Unknown'}</p>
          <p>${status === 'success' ? 'Thank you for your purchase!' : 'Please try again or contact support.'}</p>
          
          <button onclick="window.location.href='/server-payment-test'">
            Return to Test Page
          </button>
        </div>
      </body>
      </html>
    `);
  });
}

module.exports = { addPaymentUrlEndpoint };

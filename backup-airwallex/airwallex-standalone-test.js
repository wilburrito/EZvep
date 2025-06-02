// Standalone test for Airwallex integration with a minimal HTTP server
require('dotenv').config();
const http = require('http');
const url = require('url');
const { 
  initializeAirwallex, 
  createPaymentIntent, 
  getPaymentIntent, 
  createMockPaymentIntent 
} = require('./airwallex-integration');

// Randomly pick a port that's less likely to be in use
const PORT = 9876;

// Create a simple server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`Received request: ${req.method} ${path}`);
  
  try {
    // Basic route handler
    if (path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Airwallex Test</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #2e186a; }
              button { background: #2e186a; color: white; border: none; padding: 10px 20px; margin: 10px 0; cursor: pointer; }
              pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
              .success { color: green; font-weight: bold; }
              .error { color: red; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Airwallex Integration Test</h1>
            <p>Server is running on port ${PORT}</p>
            <button onclick="testAirwallex()">Test Airwallex Integration</button>
            <button onclick="createPayment()">Create Test Payment Intent</button>
            <div id="result"></div>
            
            <script>
              function testAirwallex() {
                document.getElementById('result').innerHTML = '<p>Testing Airwallex integration...</p>';
                fetch('/test-airwallex')
                  .then(response => response.json())
                  .then(data => {
                    document.getElementById('result').innerHTML = 
                      '<p class="' + (data.success ? 'success' : 'error') + '">' + 
                      (data.success ? 'SUCCESS: ' : 'ERROR: ') + data.message + '</p>' +
                      '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                  })
                  .catch(err => {
                    document.getElementById('result').innerHTML = 
                      '<p class="error">ERROR: ' + err.message + '</p>';
                  });
              }
              
              function createPayment() {
                document.getElementById('result').innerHTML = '<p>Creating test payment intent...</p>';
                fetch('/create-payment', { method: 'POST' })
                  .then(response => response.json())
                  .then(data => {
                    document.getElementById('result').innerHTML = 
                      '<p class="' + (data.success ? 'success' : 'error') + '">' + 
                      (data.success ? 'SUCCESS: ' : 'ERROR: ') + data.message + '</p>' +
                      '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                  })
                  .catch(err => {
                    document.getElementById('result').innerHTML = 
                      '<p class="error">ERROR: ' + err.message + '</p>';
                  });
              }
            </script>
          </body>
        </html>
      `);
    }
    else if (path === '/test-airwallex') {
      // Test Airwallex SDK initialization
      try {
        console.log('Testing Airwallex SDK initialization...');
        const airwallex = initializeAirwallex();
        
        if (!airwallex) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'Failed to initialize Airwallex SDK',
            details: 'SDK initialization returned null or undefined'
          }));
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          message: 'Airwallex SDK initialized successfully',
          config: {
            clientId: process.env.AIRWALLEX_CLIENT_ID ? '(configured)' : '(missing)',
            apiKey: process.env.AIRWALLEX_API_KEY ? '(configured)' : '(missing)',
            environment: process.env.AIRWALLEX_ENV || 'demo'
          }
        }));
      } catch (error) {
        console.error('Error initializing Airwallex SDK:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          message: 'Error initializing Airwallex SDK',
          error: error.message
        }));
      }
    }
    else if (path === '/create-payment' && req.method === 'POST') {
      // Create a test payment intent
      try {
        console.log('Creating test payment intent...');
        const airwallex = initializeAirwallex();
        
        if (!airwallex) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'Failed to initialize Airwallex SDK',
            details: 'SDK initialization returned null or undefined'
          }));
        }
        
        // Create test payment payload
        const crypto = require('crypto');
        const orderID = `order_${crypto.randomBytes(8).toString('hex')}`;
        const requestID = `req_${crypto.randomBytes(8).toString('hex')}`;
        
        const testPayload = {
          amount: 1.00,
          currency: 'SGD',
          merchant_order_id: orderID,
          descriptor: 'EZVEP Test',
          return_url: `http://127.0.0.1:${PORT}/payment-success`,
          expired_time: Math.floor(Date.now() / 1000) + 3600,
          metadata: {
            customer_name: 'Test User',
            customer_email: 'test@example.com'
          },
          request_id: requestID,
          order: {
            products: [
              {
                name: 'Test Product',
                quantity: 1,
                price: 1.00,
                currency: 'SGD',
                sku: 'TEST-SKU-01'
              }
            ]
          }
        };
        
        console.log('Payment intent payload:', JSON.stringify(testPayload, null, 2));
        
        try {
          // Call the Airwallex API to create a payment intent
          const paymentIntent = await createPaymentIntent(airwallex, testPayload);
          
          console.log('Payment intent created successfully:', paymentIntent.id);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            message: 'Payment intent created successfully',
            paymentIntent: {
              id: paymentIntent.id,
              client_secret: paymentIntent.client_secret,
              status: paymentIntent.status
            }
          }));
        } catch (apiError) {
          console.error('Error creating payment intent:', apiError);
          
          // Try fallback mock payment intent
          console.log('Using fallback mock payment intent...');
          const mockIntent = createMockPaymentIntent();
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            message: 'Created mock payment intent (API call failed)',
            error: apiError.message,
            isMock: true,
            mockPaymentIntent: {
              id: mockIntent.id,
              client_secret: mockIntent.client_secret
            }
          }));
        }
      } catch (error) {
        console.error('Server error creating payment intent:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          message: 'Server error creating payment intent',
          error: error.message
        }));
      }
    }
    else {
      // Not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (error) {
    // General error handler
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + error.message);
  }
});

// Try both localhost and 127.0.0.1 bindings
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n=== AIRWALLEX STANDALONE TEST SERVER ===`);
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  console.log(`Open the URL above in your browser to test Airwallex integration`);
});

// Error handler for server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try running the script again with a different port.`);
  } else {
    console.error('Server error:', error);
  }
});

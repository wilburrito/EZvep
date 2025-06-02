// Most basic HTTP server possible - should work on any system
const http = require('http');
const { 
  initializeAirwallex, 
  createPaymentIntent, 
  getPaymentIntent, 
  createMockPaymentIntent 
} = require('./airwallex-integration');
require('dotenv').config();

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Set CORS headers to allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Basic router
  if (req.url === '/') {
    // Homepage
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>EZVEP Test Server</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2e186a; }
            .endpoint { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; }
            button { background: #2e186a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>EZVEP Basic Test Server</h1>
          <p>Server is running successfully!</p>
          
          <h2>Available Test Endpoints:</h2>
          <div class="endpoint">
            <h3>/api/test</h3>
            <p>Basic API test endpoint</p>
            <button onclick="fetch('/api/test').then(r=>r.json()).then(data=>alert(JSON.stringify(data)))">Test API</button>
          </div>
          
          <div class="endpoint">
            <h3>/api/test-airwallex</h3>
            <p>Test Airwallex integration</p>
            <button onclick="fetch('/api/test-airwallex').then(r=>r.json()).then(data=>alert(JSON.stringify(data, null, 2)))">Test Airwallex</button>
          </div>
          
          <div class="endpoint">
            <h3>/api/create-payment</h3>
            <p>Create a test payment intent</p>
            <button onclick="fetch('/api/create-payment', {method:'POST'}).then(r=>r.json()).then(data=>alert(JSON.stringify(data, null, 2)))">Create Payment Intent</button>
          </div>
        </body>
      </html>
    `);
  } 
  else if (req.url === '/api/test') {
    // Basic API test
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'API is working!' }));
  }
  else if (req.url === '/api/test-airwallex') {
    // Test Airwallex connection
    try {
      // Initialize Airwallex SDK
      const airwallex = initializeAirwallex();
      
      if (!airwallex) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Failed to initialize Airwallex SDK' 
        }));
        return;
      }
      
      // Return success
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Airwallex SDK initialized successfully',
        clientId: process.env.AIRWALLEX_CLIENT_ID ? 'Configured' : 'Missing',
        apiKey: process.env.AIRWALLEX_API_KEY ? 'Configured' : 'Missing',
        environment: process.env.AIRWALLEX_ENV || 'demo'
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: error.message 
      }));
    }
  }
  else if (req.url === '/api/create-payment' && req.method === 'POST') {
    // Create a test payment intent
    try {
      // Initialize Airwallex SDK
      const airwallex = initializeAirwallex();
      
      if (!airwallex) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Failed to initialize Airwallex SDK' 
        }));
        return;
      }
      
      // Create test payment intent
      const crypto = require('crypto');
      const orderID = `order_${crypto.randomBytes(8).toString('hex')}`;
      const requestID = `req_${crypto.randomBytes(8).toString('hex')}`;
      
      const testPayload = {
        amount: 47.00,
        currency: 'SGD',
        merchant_order_id: orderID,
        descriptor: 'EZVEP Test',
        return_url: `http://localhost:3000/payment-success`,
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
              price: 47.00,
              currency: 'SGD',
              sku: 'TEST-SKU-01'
            }
          ]
        }
      };
      
      try {
        const paymentIntent = await createPaymentIntent(airwallex, testPayload);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Payment intent created successfully',
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status
          }
        }));
      } catch (apiError) {
        console.error('API Error:', apiError.message);
        
        // Try fallback
        const mockIntent = createMockPaymentIntent();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Created mock payment intent (fallback)',
          mock: true,
          paymentIntent: {
            id: mockIntent.id,
            clientSecret: mockIntent.client_secret
          }
        }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: error.message 
      }));
    }
  }
  else {
    // Not found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Set port
const PORT = 8080;

// Start server with explicit binding to 0.0.0.0 (all interfaces)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic HTTP server running at http://localhost:${PORT}`);
  console.log(`Try opening http://localhost:${PORT} in your browser`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error('Server error:', error);
  }
});

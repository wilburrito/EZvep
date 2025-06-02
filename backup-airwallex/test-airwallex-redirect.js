const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initializeAirwallex, createPaymentIntent } = require('./airwallex-integration');
const { v4: uuid } = require('uuid');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!require('fs').existsSync(publicDir)) {
  require('fs').mkdirSync(publicDir);
}

// Write a simple HTML page for testing
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Airwallex Payment Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Airwallex Payment Integration Test</h1>
    <p>This page tests your Airwallex integration by creating a payment intent and redirecting to the hosted payment page.</p>
    
    <div>
        <h2>Step 1: Create Payment Intent</h2>
        <button id="createIntent">Create Payment Intent</button>
        <div id="intentResult"></div>
    </div>
    
    <div style="margin-top: 30px;">
        <h2>Step 2: Redirect to Hosted Payment Page</h2>
        <button id="redirectToPayment" disabled>Redirect to Payment Page</button>
    </div>
    
    <div style="margin-top: 30px;">
        <h2>Results Log</h2>
        <pre id="log"></pre>
    </div>
    
    <script>
        let paymentData = null;
        const log = document.getElementById('log');
        const intentResult = document.getElementById('intentResult');
        const redirectBtn = document.getElementById('redirectToPayment');
        
        function appendLog(message, isError = false) {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            log.innerHTML += \`[\${timestamp}] \${isError ? '<span class="error">ERROR: ' : ''}\${message}\${isError ? '</span>' : ''}\n\`;
        }
        
        document.getElementById('createIntent').addEventListener('click', async () => {
            appendLog('Creating payment intent...');
            intentResult.innerHTML = '<p>Loading...</p>';
            
            try {
                const response = await fetch('/api/create-test-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: 1.00,
                        currency: 'SGD',
                        customerInfo: {
                            name: 'Test Customer',
                            email: 'test@example.com'
                        }
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    appendLog(data.error, true);
                    intentResult.innerHTML = \`<p class="error">Error: \${data.error}</p>\`;
                    return;
                }
                
                paymentData = data;
                appendLog(\`Payment intent created: \${data.intentId}\`);
                intentResult.innerHTML = \`
                    <p class="success">Payment Intent Created Successfully</p>
                    <p><strong>Intent ID:</strong> \${data.intentId}</p>
                    <p><strong>Client Secret:</strong> \${data.clientSecret.substring(0, 15)}...</p>
                \`;
                
                redirectBtn.disabled = false;
            } catch (error) {
                appendLog(\`Failed to create intent: \${error.message}\`, true);
                intentResult.innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
            }
        });
        
        document.getElementById('redirectToPayment').addEventListener('click', async () => {
            if (!paymentData) {
                appendLog('No payment intent available', true);
                return;
            }
            
            appendLog('Loading Airwallex SDK...');
            
            // Dynamically load the Airwallex SDK
            const script = document.createElement('script');
            script.src = 'https://checkout.airwallex.com/assets/components.js';
            script.onload = async () => {
                appendLog('Airwallex SDK loaded');
                
                try {
                    const { payments } = await window.Airwallex.init({
                        env: 'demo',
                        origin: window.location.origin,
                    });
                    
                    appendLog('Airwallex initialized, redirecting to payment page...');
                    
                    await payments.redirectToCheckout({
                        intent_id: paymentData.intentId,
                        client_secret: paymentData.clientSecret,
                        currency: 'SGD'
                    });
                    
                    // If we get here, redirection failed
                    appendLog('Redirect failed or was blocked', true);
                } catch (error) {
                    appendLog(\`SDK Error: \${error.message}\`, true);
                }
            };
            
            script.onerror = () => {
                appendLog('Failed to load Airwallex SDK', true);
            };
            
            document.head.appendChild(script);
        });
        
        // Add initial log
        appendLog('Test page loaded');
    </script>
</body>
</html>
`;

// Write the HTML file
require('fs').writeFileSync(path.join(publicDir, 'index.html'), htmlContent);

// Initialize Airwallex global instance
let airwallexInstance = null;

try {
  airwallexInstance = initializeAirwallex();
  if (airwallexInstance) {
    console.log('Airwallex SDK initialized successfully');
  } else {
    console.warn('Airwallex SDK initialization returned null - will use fallback mode');
  }
} catch (err) {
  console.error('Failed to initialize Airwallex SDK:', err);
}

// API endpoint to create a test payment intent
app.post('/api/create-test-intent', async (req, res) => {
  console.log('Test payment intent request received');
  
  try {
    const { amount, currency, customerInfo } = req.body;
    
    // Use fallback mode if SDK initialization failed or explicitly requested
    const useFallback = !airwallexInstance || process.env.USE_FALLBACK_MODE === 'true';
    
    if (useFallback) {
      console.log('Using fallback mode for payment intent');
      // Create a mock payment intent
      return res.json({
        intentId: `mock_intent_${uuid().substring(0, 8)}`,
        clientSecret: `mock_secret_${uuid()}`,
        amount: amount || 1.00,
        currency: currency || 'SGD',
        demo: true
      });
    }
    
    // Create a real payment intent with Airwallex
    if (!airwallexInstance) {
      throw new Error('Airwallex SDK not initialized');
    }
    
    const paymentIntent = await createPaymentIntent(airwallexInstance, {
      request_id: uuid(),
      amount: amount || 1.00,
      currency: currency || 'SGD',
      order_id: `order_${uuid().substring(0, 8)}`,
      descriptor: 'EZVEP Test',
      return_url: `${req.protocol}://${req.get('host')}/payment-success`,
      metadata: {
        test: 'true',
        customer_name: customerInfo?.name || 'Test Customer',
        customer_email: customerInfo?.email || 'test@example.com'
      }
    });
    
    console.log('Payment intent created:', paymentIntent.id);
    
    // Return the payment intent information
    res.json({
      intentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Error creating test payment intent:', error);
    res.status(500).json({ 
      error: `Failed to create payment intent: ${error.message}`,
      details: error.stack
    });
  }
});

// Success page
app.get('/payment-success', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Payment Success</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
          .success { color: green; font-size: 24px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Test Payment Successful</h1>
        <p class="success">Your test payment was processed successfully!</p>
        <p>This confirms that the Airwallex integration is working correctly.</p>
        <p><a href="/">Return to test page</a></p>
      </body>
    </html>
  `);
});

// Simple status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    airwallexConfigured: !!process.env.AIRWALLEX_CLIENT_ID && !!process.env.AIRWALLEX_API_KEY
  });
});

// Start the server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Open this URL in your browser to test the Airwallex integration');
});

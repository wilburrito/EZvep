require('dotenv').config();
const Airwallex = require('airwallex');
const fs = require('fs');
const path = require('path');

async function debugAirwallex() {
  console.log('=== AIRWALLEX DEBUG SCRIPT ===');
  console.log('Current directory:', process.cwd());
  
  // 1. Check if .env file exists and can be read
  const envPath = path.join(process.cwd(), '.env');
  console.log('Checking .env file at:', envPath);
  
  try {
    const envExists = fs.existsSync(envPath);
    console.log('.env file exists:', envExists);
    
    if (envExists) {
      const envContents = fs.readFileSync(envPath, 'utf8');
      // Only show first line as preview to avoid exposing credentials
      console.log('.env file preview (first line):', envContents.split('\n')[0]);
      
      // Count lines in the file
      const lineCount = envContents.split('\n').length;
      console.log('.env file line count:', lineCount);
    }
  } catch (err) {
    console.error('Error accessing .env file:', err.message);
  }
  
  // 2. Check environment variables
  console.log('\n=== Environment Variables ===');
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const env = process.env.AIRWALLEX_ENV || 'demo';
  const useFallbackMode = process.env.USE_FALLBACK_MODE;
  
  console.log('AIRWALLEX_CLIENT_ID exists:', !!clientId);
  if (clientId) {
    console.log('AIRWALLEX_CLIENT_ID length:', clientId.length);
    console.log('AIRWALLEX_CLIENT_ID preview:', `${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)}`);
  }
  
  console.log('AIRWALLEX_API_KEY exists:', !!apiKey);
  if (apiKey) {
    console.log('AIRWALLEX_API_KEY length:', apiKey.length);
    console.log('AIRWALLEX_API_KEY preview:', `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
  }
  
  console.log('AIRWALLEX_ENV:', env);
  console.log('USE_FALLBACK_MODE:', useFallbackMode);
  console.log('USE_FALLBACK_MODE parsed as boolean:', useFallbackMode === 'true');
  
  // 3. Test SDK initialization
  console.log('\n=== SDK Initialization ===');
  if (!clientId || !apiKey) {
    console.error('ERROR: Missing required credentials, cannot initialize SDK');
    return;
  }
  
  try {
    console.log('Initializing Airwallex SDK...');
    const airwallex = new Airwallex({
      clientId: clientId,
      clientSecret: apiKey,
      environment: env === 'prod' ? 'production' : 'demo'
    });
    
    console.log('SDK initialized successfully');
    
    // 4. Test basic API call
    console.log('\n=== API Connection Test ===');
    
    // Create unique IDs for this test
    const requestId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    console.log('Request ID:', requestId);
    console.log('Order ID:', orderId);
    
    const payload = {
      amount: 0.01,
      currency: 'SGD',
      request_id: requestId,
      merchant_order_id: orderId
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Calling Airwallex API...');
    
    const result = await airwallex.execute({
      method: 'post',
      url: '/api/v1/pa/payment_intents/create',
      body: payload
    });
    
    console.log('API call successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('ERROR during Airwallex test:');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('Full error:', error);
    return false;
  }
}

// Run the debug function
debugAirwallex()
  .then(success => {
    console.log('\n=== TEST RESULT ===');
    console.log(success ? 'SUCCESS: Airwallex connection is working properly' : 'FAILED: Could not connect to Airwallex API');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error in debug script:', err);
    process.exit(1);
  });

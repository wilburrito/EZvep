require('dotenv').config();
const Airwallex = require('airwallex');

async function testAirwallexConnection() {
  console.log('Starting Airwallex connection test...');
  
  // Get credentials from environment
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const env = process.env.AIRWALLEX_ENV || 'demo';
  
  console.log('Using environment:', env);
  console.log('Client ID exists:', !!clientId);
  console.log('API Key exists:', !!apiKey);
  
  if (!apiKey || !clientId) {
    console.error('ERROR: Missing Airwallex credentials in .env file');
    process.exit(1);
  }
  
  try {
    console.log('Initializing Airwallex SDK...');
    const airwallex = new Airwallex({
      clientId: clientId,
      clientSecret: apiKey,
      environment: env
    });
    
    console.log('Airwallex SDK initialized successfully');
    
    // Try a simple API call that doesn't create a real payment
    console.log('Testing API connection with a simple call...');
    
    // Create a test payment intent with minimal data
    const requestId = `test_${Date.now()}`;
    const orderId = `order_test_${Date.now()}`;
    
    const payload = {
      amount: 0.01,
      currency: 'SGD',
      request_id: requestId,
      merchant_order_id: orderId
    };
    
    console.log('Creating test payment intent...');
    // Use the execute method with the correct API endpoint
    const paymentIntent = await airwallex.execute({
      method: 'post',
      url: '/api/v1/pa/payment_intents/create',
      body: payload
    });
    
    console.log('SUCCESS! Payment intent created:');
    console.log(JSON.stringify(paymentIntent, null, 2));
    
    return true;
  } catch (error) {
    console.error('ERROR connecting to Airwallex:');
    console.error(error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

testAirwallexConnection().then(success => {
  if (success) {
    console.log('Airwallex connection test PASSED');
  } else {
    console.log('Airwallex connection test FAILED');
  }
});

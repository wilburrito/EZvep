// Direct test for Airwallex integration without server dependency
require('dotenv').config();
const { 
  initializeAirwallex, 
  createPaymentIntent, 
  getPaymentIntent, 
  createMockPaymentIntent 
} = require('./airwallex-integration');

console.log('=== DIRECT AIRWALLEX INTEGRATION TEST ===');

async function testAirwallexIntegration() {
  console.log('Testing Airwallex integration directly...');
  
  try {
    // Initialize Airwallex SDK
    console.log('Initializing Airwallex SDK...');
    const airwallex = initializeAirwallex();
    
    if (!airwallex) {
      console.log('❌ Failed to initialize Airwallex SDK');
      return false;
    }
    
    console.log('✅ Successfully initialized Airwallex SDK');
    
    // Create a test payment intent
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
    
    console.log('Creating test payment intent...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    try {
      const paymentIntent = await createPaymentIntent(airwallex, testPayload);
      
      console.log('✅ Successfully created payment intent!');
      console.log('Payment Intent ID:', paymentIntent.id);
      console.log('Client Secret:', paymentIntent.client_secret);
      
      // Now try to retrieve the payment intent
      console.log('\nRetrieving payment intent...');
      const retrievedIntent = await getPaymentIntent(airwallex, paymentIntent.id);
      
      console.log('✅ Successfully retrieved payment intent!');
      console.log('Payment Intent Status:', retrievedIntent.status);
      
      return true;
    } catch (apiError) {
      console.error('❌ Failed to create payment intent:', apiError.message);
      
      console.log('\nTrying fallback mock payment intent...');
      const mockPaymentIntent = createMockPaymentIntent();
      
      console.log('Mock payment intent created:');
      console.log('ID:', mockPaymentIntent.id);
      console.log('Client Secret:', mockPaymentIntent.client_secret);
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error in Airwallex integration test:', error);
    return false;
  }
}

// Run the test
testAirwallexIntegration()
  .then(success => {
    console.log('\n=== TEST RESULT ===');
    if (success) {
      console.log('✅ Airwallex integration is working properly');
    } else {
      console.log('❌ Airwallex integration test failed');
    }
  })
  .catch(err => {
    console.error('\n=== TEST FAILED WITH ERROR ===');
    console.error(err);
  });

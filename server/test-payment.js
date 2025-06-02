// Simple test script for the Airwallex payment integration
require('dotenv').config();
const axios = require('axios');

async function testPaymentEndpoint() {
  console.log('=== PAYMENT ENDPOINT TEST ===');
  
  try {
    // Test data for payment intent
    const testData = {
      amount: 1.00,
      currency: 'SGD',
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };
    
    console.log('Sending test payment intent request:', JSON.stringify(testData, null, 2));
    
    // Make a request to our local payment intent endpoint
    const response = await axios.post('http://localhost:3001/api/create-payment-intent', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Payment intent created successfully');
      console.log('Client Secret:', response.data.clientSecret);
      console.log('Intent ID:', response.data.intentId);
      
      if (response.data.mock) {
        console.log('⚠️ NOTE: This is a mock payment intent (fallback mode)');
      }
    } else {
      console.log('❌ FAILED: Could not create payment intent');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ ERROR calling payment endpoint:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

// Run the test
testPaymentEndpoint()
  .then(result => {
    console.log('\n=== TEST RESULT ===');
    console.log(result.success ? 'Payment endpoint is working' : 'Payment endpoint failed');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n=== TEST FAILED ===');
    console.error(err);
    process.exit(1);
  });

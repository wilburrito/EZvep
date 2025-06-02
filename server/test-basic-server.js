// Test connection to our basic HTTP server
const axios = require('axios');

async function testBasicServerConnection() {
  console.log('Testing connection to basic HTTP server...');
  const port = 8080;
  
  try {
    // Test root endpoint
    console.log(`Attempting to connect to http://localhost:${port}/...`);
    const rootResponse = await axios.get(`http://localhost:${port}/`);
    console.log('Root endpoint response status:', rootResponse.status);
    
    // Test API endpoint
    console.log(`\nTesting API endpoint http://localhost:${port}/api/test...`);
    const apiResponse = await axios.get(`http://localhost:${port}/api/test`);
    console.log('API test response:', apiResponse.data);
    
    // Test Airwallex integration
    console.log(`\nTesting Airwallex integration http://localhost:${port}/api/test-airwallex...`);
    const airwallexResponse = await axios.get(`http://localhost:${port}/api/test-airwallex`);
    console.log('Airwallex test response:', airwallexResponse.data);
    
    // Test payment intent creation
    console.log(`\nTesting payment intent creation http://localhost:${port}/api/create-payment...`);
    const paymentResponse = await axios.post(`http://localhost:${port}/api/create-payment`);
    console.log('Payment intent creation response:', paymentResponse.data);
    
    console.log('\n✅ All tests passed! Server is accessible and Airwallex integration is working!');
    return true;
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

testBasicServerConnection()
  .then(success => {
    console.log(success ? '\nTest successful - Server is accessible and working' : '\nTest failed - Check server logs for details');
  })
  .catch(err => {
    console.error('Unexpected test error:', err);
  });

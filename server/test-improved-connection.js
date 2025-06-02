// Test connection to our main server
const axios = require('axios');

async function testConnection() {
  console.log('Testing connection to main server...');
  const port = 5000; // Use the same port our server is running on
  
  try {
    // First test a basic connection to the root endpoint
    console.log(`Attempting to connect to http://127.0.0.1:${port}/...`);
    const rootResponse = await axios.get(`http://127.0.0.1:${port}/`);
    console.log('Root endpoint response:', rootResponse.status, rootResponse.statusText);
    
    // Now test the Airwallex test endpoint
    console.log(`\nAttempting to connect to http://127.0.0.1:${port}/api/test-airwallex...`);
    const airwallexTestResponse = await axios.get(`http://127.0.0.1:${port}/api/test-airwallex`);
    console.log('Airwallex test endpoint response:', airwallexTestResponse.data);
    
    console.log('\n✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
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

testConnection()
  .then(success => {
    console.log(success ? '\nTest passed - Server is accessible!' : '\nTest failed - Server is not accessible');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test error:', err);
    process.exit(1);
  });

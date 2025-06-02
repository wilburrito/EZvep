// Test connection to our test server
const axios = require('axios');

async function testConnection() {
  console.log('Testing connection to test server...');
  
  try {
    const response = await axios.get('http://localhost:4000/api/test');
    console.log('Server response:', response.data);
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

testConnection()
  .then(success => {
    console.log(success ? 'Test passed' : 'Test failed');
  })
  .catch(err => {
    console.error('Test error:', err);
  });

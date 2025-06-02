// Simple HTTP client to test our standalone server
const http = require('http');

console.log('Testing connection to the standalone Airwallex test server...');

const options = {
  hostname: '127.0.0.1',
  port: 9876,
  path: '/test-airwallex',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Server response:');
      console.log(JSON.stringify(response, null, 2));
      console.log('\n✅ Connection successful!');
    } catch (e) {
      console.log('Raw response:', data);
      console.log('\n❌ Could not parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Connection error: ${e.message}`);
  if (e.code === 'ECONNREFUSED') {
    console.error('The server is not running or not accessible at 127.0.0.1:9876');
  }
});

req.end();

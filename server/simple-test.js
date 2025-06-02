// Simple server connectivity test
const http = require('http');

console.log('=== SIMPLE SERVER CONNECTION TEST ===');
console.log('Attempting to connect to server at http://localhost:3001');

const req = http.request({
  host: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
}, (res) => {
  console.log(`Server responded with status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
    console.log('✅ SUCCESS: Server is responding');
  });
});

req.on('error', (e) => {
  console.error(`❌ ERROR: ${e.message}`);
  console.error('This likely means the server is not running or is not accessible');
  console.error('Please check if the server is running on port 5000');
});

req.end();

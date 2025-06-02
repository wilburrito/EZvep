// Simple Express server test
const express = require('express');
const app = express();

// Define a test port - explicitly using 4000 to avoid conflicts
const PORT = 4000;

// Basic route
app.get('/', (req, res) => {
  res.send('Test server is running!');
});

// Simple API endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Start the server with explicit host binding
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Try accessing http://localhost:${PORT}/api/test in your browser or test script`);
});

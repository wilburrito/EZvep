/**
 * Script to update all return URLs to point to the frontend application
 */
const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  'payment-url-endpoint.js',
  'airwallex-server-flow.js'
];

// Update environment variables first
console.log('Updating environment variables...');
try {
  // Create a new .env file with USE_FALLBACK_MODE=false
  fs.writeFileSync(
    path.join(__dirname, '.env'),
    'USE_FALLBACK_MODE=false\n' +
    'AIRWALLEX_ENV=demo\n' +
    // Keep any existing variables from the current .env if it exists
    (fs.existsSync(path.join(__dirname, '.env')) 
      ? fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
        .split('\n')
        .filter(line => !line.startsWith('USE_FALLBACK_MODE='))
        .join('\n')
      : '')
  );
  console.log('Updated .env file with USE_FALLBACK_MODE=false');
} catch (error) {
  console.error('Error updating .env file:', error.message);
}

// Update return URLs in all files
for (const file of files) {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all occurrences of localhost:5000/payment-result with localhost:3000/payment-success
    const oldPattern = /localhost:5000\/payment-result/g;
    const newUrl = 'localhost:3000/payment-success';
    
    const updatedContent = content.replace(oldPattern, newUrl);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated return URLs in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  } catch (error) {
    console.error(`Error updating ${file}:`, error.message);
  }
}

console.log('All updates completed. Restart the server to apply changes.');

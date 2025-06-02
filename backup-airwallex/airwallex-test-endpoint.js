/**
 * Airwallex Test Endpoint
 * 
 * This file contains Express route handlers for testing Airwallex configuration
 */

/**
 * Adds the Airwallex test endpoints to an Express app
 * @param {Object} app - Express app instance
 */
function addAirwallexTestEndpoints(app) {
  // Add endpoint for testing Airwallex configuration
  app.get('/api/test-airwallex', (req, res) => {
    // Get Airwallex configuration from environment variables
    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    const apiKey = process.env.AIRWALLEX_API_KEY;
    const environment = process.env.AIRWALLEX_ENV || 'demo';
    const useFallbackMode = process.env.USE_FALLBACK_MODE === 'true';
    
    // Send configuration status (without exposing actual credentials)
    res.json({
      clientIdAvailable: !!clientId,
      apiKeyAvailable: !!apiKey,
      environment,
      useFallbackMode
    });
  });

  // Add a basic API test endpoint
  app.get('/api/test', (req, res) => {
    res.send('API is working!');
  });

  // Serve the Airwallex test page
  app.get('/airwallex-test', (req, res) => {
    const path = require('path');
    const filePath = path.join(__dirname, 'airwallex-test.html');
    console.log('Serving Airwallex test page from:', filePath);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving Airwallex test page:', err);
        res.status(err.status).end();
      } else {
        console.log('Successfully served Airwallex test page');
      }
    });
  });
  
  // Fallback route for debugging
  app.get('/airwallex-test-status', (req, res) => {
    res.json({ status: 'API endpoint working', time: new Date().toISOString() });
  });
}

module.exports = { addAirwallexTestEndpoints };

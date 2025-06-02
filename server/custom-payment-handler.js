/**
 * Custom Payment Page Handler
 * 
 * Provides routes for serving a custom payment page that uses 
 * Airwallex Drop-in elements for a more reliable payment experience.
 */
const path = require('path');

/**
 * Adds routes for the custom payment page
 * @param {Object} app - Express application
 */
function addCustomPaymentRoutes(app) {
  // Serve the custom payment page
  app.get('/custom-payment', (req, res) => {
    const filePath = path.join(__dirname, 'payment-page.html');
    console.log('Serving custom payment page from:', filePath);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending payment page:', err);
        res.status(err.status || 500).end();
      }
    });
  });
}

/**
 * Creates a URL for the custom payment page with required parameters
 * @param {Object} paymentDetails - Payment intent details
 * @returns {string} Custom payment page URL
 */
function createCustomPaymentUrl(paymentDetails) {
  const params = new URLSearchParams({
    intent_id: paymentDetails.intentId,
    client_secret: paymentDetails.clientSecret,
    amount: paymentDetails.amount.toString(),
    currency: paymentDetails.currency,
    order_id: paymentDetails.orderId || `order_${Date.now()}`,
    return_url: paymentDetails.returnUrl || 'http://localhost:3000/payment-success'
  });

  // Using an absolute URL here to ensure it works properly
  return `http://localhost:${process.env.PORT || 3001}/custom-payment?${params.toString()}`;
}

module.exports = {
  addCustomPaymentRoutes,
  createCustomPaymentUrl
};

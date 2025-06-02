# Testing with Airwallex Hosted Payment Page

This guide will help you properly test the EZVEP checkout flow with the real Airwallex hosted payment page.

## Environment Setup

1. Make sure your `.env` file in the server directory contains the following variables:

```
USE_FALLBACK_MODE=false
AIRWALLEX_CLIENT_ID=your_airwallex_client_id
AIRWALLEX_API_KEY=your_airwallex_api_key
AIRWALLEX_ENV=demo
PORT=5000
```

## Testing Steps

1. **Restart the server**: Make sure to restart the server after updating your `.env` file
   ```
   cd server
   node index.js
   ```

2. **Run the frontend application**: Make sure your React frontend is running on port 3000
   ```
   cd ..
   npm start
   ```

3. **Test the checkout flow**:
   - Go to http://localhost:3000
   - Navigate to the checkout page
   - Fill in customer information
   - Complete the checkout process
   - You should be redirected to the Airwallex hosted payment page
   - After completing the payment, you should be redirected back to the success page

## Troubleshooting

If you encounter issues with the Airwallex integration:

1. **Check the server logs**: Look for any error messages related to Airwallex API calls
2. **Verify credentials**: Ensure your Airwallex API credentials are correct
3. **Test with mock payment**: Set `USE_FALLBACK_MODE=true` in your `.env` file to test with the mock payment page
4. **Debug with the payment-debug.html page**: Visit http://localhost:5000/payment-debug.html to test the payment flow directly

## Note on Google Reviews Integration

The payment flow has been implemented to work seamlessly with the existing Google Reviews section and other website features. The checkout process should not interfere with the reviews carousel or other UI elements.

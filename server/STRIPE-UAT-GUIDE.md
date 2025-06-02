# EZVEP Stripe Payment Integration - UAT Testing Guide

## Overview
This guide outlines the process for User Acceptance Testing (UAT) of the EZVEP Stripe payment integration before deployment to the production environment.

## Prerequisites
- Node.js server running locally on port 3001
- Stripe test API keys configured in `.env` file or through the manual environment setup
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Testing Environment
The EZVEP backend has been configured with Stripe test API keys, which means:
- No real money is charged during testing
- Test credit card numbers can be used to simulate various payment scenarios
- All transactions appear in your Stripe dashboard under "Test Mode"

## UAT Test Pages

### Primary UAT Test Page (Recommended)
**URL:** http://localhost:3001/stripe-uat

This comprehensive test page provides:
- Multiple test scenarios (standard checkout, custom amount, zero dollar, high value)
- Detailed test card information
- Step-by-step testing instructions
- Error handling validation

### Alternative Test Pages
- **Simple Direct Test:** http://localhost:3001/stripe-direct
- **Standard Test Page:** http://localhost:3001/stripe-test

## Test Scenarios to Cover

1. **Standard Payment (SGD 47.00)**
   - Use successful test card (`4242 4242 4242 4242`)
   - Verify success page and database record

2. **Failed Payment**
   - Use declined test card (`4000 0000 0000 0002`)
   - Verify error handling and user messaging

3. **Edge Cases**
   - Zero-dollar transaction (if applicable)
   - High-value transaction (SGD 999.99)
   - Invalid input handling

4. **Webhook Testing** (if applicable)
   - Trigger test webhook events from Stripe dashboard
   - Verify event handling (e.g., payment_intent.succeeded)

## Test Card Information

### Successful Payments
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/30`)
- CVC: Any 3 digits (e.g., `123`)
- Name and Postal Code: Any values

### Failed Payments
- Generic Decline: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 9995`
- Other test cards: [Stripe Test Cards Documentation](https://stripe.com/docs/testing#cards)

## UAT Testing Procedure

1. Start the EZVEP server locally (`node index.js` in the server directory)
2. Open the UAT test page at http://localhost:3001/stripe-uat
3. Select a test scenario or customize parameters
4. Enter customer details (any name and valid email format)
5. Click "Create Checkout Session" to generate a Stripe checkout link
6. Click "Proceed to Payment" to open the Stripe checkout page
7. Enter test card details and complete the payment
8. Verify the appropriate success or error page is displayed
9. Check Stripe dashboard to confirm the transaction record
10. Repeat with different test scenarios and card types

## Expected Results

### Successful Payment Flow
1. Checkout session is created successfully
2. Stripe hosted payment page loads correctly
3. Payment is processed without errors
4. User is redirected to success page
5. Transaction appears in Stripe dashboard

### Error Handling
1. Invalid input errors are displayed appropriately
2. Declined payments show proper error messages
3. Server errors are handled gracefully
4. Cancelled payments redirect to the cancel page

## Reporting Issues
If you encounter any issues during UAT testing, please document:
1. The test scenario and steps to reproduce
2. Expected vs. actual behavior
3. Any error messages (client or server)
4. Screenshots if applicable

## Post-UAT Deployment Checklist
- [ ] All test scenarios passed
- [ ] Error handling validated
- [ ] Webhook functionality confirmed (if applicable)
- [ ] Stripe dashboard integration verified
- [ ] API key rotation plan for production established
- [ ] Production environment variables configured (separate from test)

## Additional Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)

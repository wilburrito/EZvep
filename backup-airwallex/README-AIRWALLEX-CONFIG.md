# Airwallex Payment Integration Configuration

To enable Airwallex payments for the DIY VEP E-Guide checkout, add the following variables to your `.env` file:

```
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_API_KEY=your_api_key
```

## Required API Permissions

When creating a restricted API key in Airwallex, grant the following permissions:

1. **Authentication**:
   - `authentication:login` - To authenticate with the Airwallex API

2. **Payment Intents**:
   - `pa:payment_intents:create` - To create payment intents
   - `pa:payment_intents:read` - To retrieve payment intent details

3. **Payment Methods**:
   - `pa:payment_methods:create` - To create payment methods

4. **Customers** (optional but recommended):
   - `customers:create` - To create customer records
   - `customers:read` - To retrieve customer information

These permissions are sufficient for the Drop-in Element integration, which supports Mastercard and Visa payment methods.

## Important Notes:

1. You'll need to create an Airwallex account and get your API credentials from your Airwallex dashboard.

2. For testing, the system is currently configured to use Airwallex's demo environment. For production, change the `env` parameter from 'demo' to 'prod' in the checkout page.

3. Test card for development:
   - Card number: 4242 4242 4242 4242
   - Expiry date: Any future date
   - CVC: Any 3 digits

4. The implementation includes a fallback that will simulate successful payments if the Airwallex credentials are not configured. This is for development purposes only and should be removed in production.

5. For production, update the Airwallex endpoints and ensure proper error handling and security measures are in place.

## Payment Flow:

1. When a user enters their details and proceeds to checkout, the system will:
   - Create a payment intent with Airwallex
   - Initialize the card element interface
   - Process the payment when the user completes the form
   - Deliver the DIY VEP E-Guide via email upon successful payment

2. The payment confirmation will trigger the `/api/payment-success` endpoint, which will send an email with the attached guide to the customer.

3. Make sure to replace the placeholder PDF file at `server/data/EZVEP-DIY-VEP-Guide.pdf` with your actual DIY VEP E-Guide.

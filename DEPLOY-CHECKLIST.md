# EZVEP Deployment Checklist

## Environment Variables & Security
- [x] Removed hardcoded Stripe API keys from manual-env-setup.js
- [x] Created comprehensive .env.example files for both server and frontend
- [x] Confirmed .env files are in .gitignore
- [x] Checked for and removed any debugging console.log statements with sensitive information
- [x] Updated README with proper API key and deployment setup instructions

## Code Cleanup
- [x] Removed unused Airwallex references and code
- [x] Fixed payment amount conversion (no longer multiplying by 100 on frontend)
- [x] Updated UI components for PaymentSuccess and PaymentCancel pages
- [x] Fixed navigation issues in Header component
- [x] Added form validation for customer information

## Build & Deployment
- [ ] Run a test build to make sure everything compiles correctly
- [ ] Test the complete payment flow with Stripe test cards
- [ ] Confirm all success/cancel redirects are working
- [ ] Prepare server environment variables for production

## Production Configuration Reminders
- [ ] Switch to Stripe live keys for production
- [ ] Update webhook endpoints in Stripe dashboard for production
- [ ] Configure environment-specific variables for production URLs
- [ ] Set up proper error logging for production environment

## Before GitHub Push
- [ ] Final check that no API keys or credentials are present in code
- [ ] Ensure all .env files are ignored and not committed
- [ ] Make sure node_modules and build directories are in .gitignore

## Notes for Development Team
- Use `USE_FALLBACK_MODE=true` in development to test without real Stripe API calls
- For production, set up proper environment variables on the server
- Monitor Stripe dashboard for payment activity and webhooks

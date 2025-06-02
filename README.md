# EZVEP - Event Planning Website

A full-stack React application for the EZVEP event planning service, featuring Stripe payment integration and Google Reviews API integration.

## Features

- Modern React frontend with responsive design
- Stripe payment processing for secure transactions
- Google Places API integration for reviews
- Contact form with email notifications
- Multi-language support (i18n)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EZvep
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory using the `.env.example` template:

```bash
cp server/.env.example server/.env
```

Edit the `.env` file and add your API keys and credentials:

- **Stripe API Keys**: Get these from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Google Places API Key**: Get this from the [Google Cloud Console](https://console.cloud.google.com/)
- **Email Configuration**: For contact form functionality

### 4. Run the Application

Start the backend server:

```bash
cd server
node index.js
```

In a separate terminal, start the frontend:

```bash
npm start
```

## Deployment Instructions

### Security Considerations

- **IMPORTANT**: Never commit your `.env` file to Git. It is already in `.gitignore`.
- Remove any hardcoded API keys or credentials before deploying.
- Use environment variables in production environments.

### Frontend Deployment

Build the production version of the frontend:

```bash
npm run build
```

Deploy the contents of the `build` directory to your web hosting service.

### Backend Deployment

1. Set up environment variables on your server
2. Install dependencies: `npm install`
3. Start the server with a process manager like PM2: `pm2 start server/index.js`

## Stripe Integration

The application uses Stripe Checkout for payment processing. Make sure to:

1. Set your live Stripe API keys in production
2. Configure webhook endpoints if using advanced features
3. Test thoroughly with Stripe test cards before going live

## Development Notes

- Set `USE_FALLBACK_MODE=true` in the `.env` file during development to use mock payments instead of actual Stripe API calls
- Frontend development server runs on port 3000
- Backend server runs on port 3001

## Troubleshooting

If you encounter issues with Stripe payments:

1. Check that your API keys are correct
2. Ensure the backend server is running
3. Look for errors in the browser console and server logs

## License

[Include your license information here]
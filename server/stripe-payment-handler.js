/**
 * Stripe Payment Handler
 * 
 * This module provides functionality for creating Stripe Checkout sessions
 * and handling payment success/failure redirects following the official Stripe documentation.
 * 
 * Based on: https://docs.stripe.com/checkout/quickstart?client=react&lang=node
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

// DIRECT ENV FILE READING - Bypass environment variables completely
const envPath = path.join(__dirname, '.env');
console.log('Trying to read .env file directly from:', envPath);

let stripeSecretKey = '';
let stripePublishableKey = '';
let stripeWebhookSecret = '';

// Read the .env file directly
try {
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    console.log('.env file exists, reading contents directly...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Successfully read .env file');
    
    // Parse .env file line by line
    const envLines = envContent.split('\n');
    for (const line of envLines) {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;
      
      // Parse key=value pairs
      const [key, value] = line.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        
        // Extract Stripe keys
        if (trimmedKey === 'STRIPE_SECRET_KEY') {
          stripeSecretKey = trimmedValue;
          console.log('Found STRIPE_SECRET_KEY in .env file');
        } else if (trimmedKey === 'STRIPE_PUBLISHABLE_KEY') {
          stripePublishableKey = trimmedValue;
          console.log('Found STRIPE_PUBLISHABLE_KEY in .env file');
        } else if (trimmedKey === 'STRIPE_WEBHOOK_SECRET') {
          stripeWebhookSecret = trimmedValue;
          console.log('Found STRIPE_WEBHOOK_SECRET in .env file');
        }
      }
    }
  } else {
    console.error('ERROR: .env file not found at path:', envPath);
  }
} catch (error) {
  console.error('ERROR reading .env file:', error.message);
}

// Enhanced debugging for Stripe key validation
if (!stripeSecretKey) {
  console.error('ERROR: Stripe secret key is missing! Please check your .env file.');
  throw new Error('Stripe secret key is missing - cannot continue');
} else if (stripeSecretKey.startsWith('YOUR_') || stripeSecretKey === 'sk_test_your_stripe_secret_key_here') {
  console.error('ERROR: Using placeholder Stripe secret key! Please set a real API key.');
  throw new Error('Invalid Stripe secret key format - cannot continue');
}

// Validate key format
const isTestKey = stripeSecretKey.startsWith('sk_test_');
const isLiveKey = stripeSecretKey.startsWith('sk_live_');

if (!isTestKey && !isLiveKey) {
  console.error('WARNING: Stripe secret key does not follow the expected format (sk_test_ or sk_live_).');
  console.error('This may cause issues with the Stripe API.');
}

console.log('Initializing Stripe with', isLiveKey ? 'LIVE' : isTestKey ? 'TEST' : 'UNKNOWN', 'API key:', 
  stripeSecretKey.substring(0, 7) + '...' + stripeSecretKey.substring(stripeSecretKey.length - 5));

// Make the API keys available globally
process.env.STRIPE_SECRET_KEY = stripeSecretKey;
process.env.STRIPE_PUBLISHABLE_KEY = stripePublishableKey;
process.env.STRIPE_WEBHOOK_SECRET = stripeWebhookSecret;
  
// Initialize the Stripe client with the API key
const stripe = require('stripe')(stripeSecretKey);

/**
 * Create a checkout session and return the session ID and URL
 * 
 * @param {Object} paymentDetails - Payment details including amount, currency, etc.
 * @returns {Object} Session object with ID and redirect URL
 */
async function createCheckoutSession(paymentDetails) {
  try {
    console.log('Creating Stripe checkout session with details:', paymentDetails);
    
    // Validate required parameters
    if (!paymentDetails.amount || isNaN(parseFloat(paymentDetails.amount))) {
      throw new Error('Valid amount is required');
    }
    
    // Convert amount to cents (Stripe requires amounts in smallest currency unit)
    const amountInCents = Math.round(parseFloat(paymentDetails.amount) * 100);
    const currency = (paymentDetails.currency || 'sgd').toLowerCase();
    
    // Extract customer info if provided
    const customerEmail = paymentDetails.customerEmail || undefined;
    const customerName = paymentDetails.customerName || 'EZVEP Customer';
    
    // Prepare metadata if provided
    const metadata = paymentDetails.metadata || {};
    
    // Create product name with reasonable default
    const productName = paymentDetails.productName || 'EZVEP DIY VEP Guide';
    
    // Determine base URL based on environment
    // Frontend runs on port 3000, backend on port 3001
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? (process.env.PRODUCTION_URL || 'https://ezvep.com')
      : 'http://localhost:3000';
    
    // Log the environment and base URL being used
    console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}, Base URL: ${baseUrl}`);
    
    // Use provided URLs or construct environment-aware defaults
    const successUrl = paymentDetails.successUrl || 
      `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = paymentDetails.cancelUrl || 
      `${baseUrl}/payment-cancel`;
    
    // Determine if we should use fallback mode
    if (process.env.USE_FALLBACK_MODE === 'true') {
      console.log('Using fallback mode for Stripe checkout - redirecting to mock payment');
      return createMockCheckoutSession(paymentDetails);
    }
    
    // Create line items array for the checkout session
    const lineItems = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: productName,
            description: paymentDetails.description || 'DIY VEP E-Guide with step-by-step instructions',
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ];
    
    // Create the checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        customer_name: customerName,
        ...metadata
      },
      // Optional automatic tax calculation
      // automatic_tax: { enabled: true },
    });
    
    console.log('Stripe checkout session created successfully:', session.id);
    
    // Return both the URL and session ID
    return {
      id: session.id,
      url: session.url,
      sessionId: session.id // For backwards compatibility
    };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    throw error;
  }
}

/**
 * Verify a checkout session status
 * 
 * @param {string} sessionId - The Stripe checkout session ID to verify
 * @returns {Object} Session details including payment status
 */
async function verifyPaymentStatus(sessionId) {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    console.log('Verifying payment status for session:', sessionId);
    
    // Check if we should use fallback mode
    if (process.env.USE_FALLBACK_MODE === 'true') {
      console.log('Using fallback mode for payment verification');
      return verifyMockPayment(sessionId);
    }
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    });
    
    console.log('Retrieved session status:', session.payment_status);
    
    // Ensure proper conversion from smallest currency unit to display amount
    // Stripe stores amounts in cents (smallest currency unit)
    const amountTotal = session.amount_total || 0;
    console.log('Raw amount from Stripe:', amountTotal, session.currency);
    
    // Convert from cents to actual currency (e.g., dollars)
    const displayAmount = amountTotal / 100;
    console.log('Converted display amount:', displayAmount);
    
    // Return formatted session details
    return {
      id: session.id,
      sessionId: session.id, // Adding for consistency
      status: session.payment_status,
      customer: session.customer_details,
      amount: displayAmount, // Properly converted amount
      currency: session.currency,
      paymentIntent: session.payment_intent,
      metadata: session.metadata,
      lineItems: session.line_items
    };
  } catch (error) {
    console.error('Error verifying Stripe payment status:', error.message);
    throw error;
  }
}

/**
 * Create a webhook handler for Stripe events
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('Stripe webhook secret is not configured. Skipping signature verification.');
    return res.status(400).send('Webhook secret not configured');
  }
  
  let event;
  
  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Import the fulfillment handler
  const { processPaymentSuccess } = require('./email-fulfillment-handler');
  
  // Handle the event based on its type
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment succeeded for session:', session.id);
        
        // Get expanded session data with all the information we need
        let expandedSession;
        try {
          // Retrieve the full session with expanded line items for fulfillment
          expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'line_items.data.price.product', 'customer_details']
          });
          console.log('Retrieved expanded session for fulfillment');
        } catch (expandError) {
          console.error('Error retrieving expanded session:', expandError);
          // Fall back to using the basic session object from the webhook
          expandedSession = session;
        }
        
        // Get the email transporter from the app
        const transporter = req.app.get('emailTransporter');
        
        if (!transporter) {
          console.error('Email transporter not configured in Express app');
        } else {
          // Process the payment and fulfill the order
          const fulfillmentResult = await processPaymentSuccess(expandedSession, transporter);
          
          if (fulfillmentResult.success) {
            console.log(`Order fulfilled successfully: ${fulfillmentResult.orderRef}`);
          } else {
            console.error(`Order fulfillment failed: ${fulfillmentResult.error || fulfillmentResult.reason}`);
          }
        }
        break;
      
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // We primarily use checkout.session.completed for fulfillment,
        // but could add additional logic here if needed
        break;
        
      case 'checkout.session.async_payment_succeeded':
        const asyncSession = event.data.object;
        console.log('Async payment succeeded for session:', asyncSession.id);
        // Handle async payment methods (like bank transfers) the same way
        // Could implement similar fulfillment logic here if needed
        break;
        
      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        console.log('Session expired without payment:', expiredSession.id);
        // Could implement abandoned cart recovery emails here
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    // Important: Don't return an error status here as it would cause Stripe to retry the webhook
  }
  
  // Return a 200 response to acknowledge receipt of the event
  // Always return 200 even if our processing had an error to prevent Stripe from retrying
  res.status(200).json({ received: true });
}

/**
 * Register all Stripe API routes with Express app
 * 
 * @param {Object} app - Express application
 */
function registerStripeRoutes(app) {
  // Create checkout session endpoint
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const session = await createCheckoutSession(req.body);
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Verify payment status endpoint
  app.get('/api/payment-status', async (req, res) => {
    try {
      const { sessionId } = req.query;
      const status = await verifyPaymentStatus(sessionId);
      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // IMPORTANT: This endpoint needs raw body parsing for Stripe signature verification
  // The raw body parser must be applied before any JSON body parsers
  
  // Stripe webhook endpoint (for handling events like successful payments)
  // Add both / and /webhook paths to ensure it works in all environments
  app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
  
  // Add an alternate route at root level for some hosting configurations
  app.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
  
  console.log('Stripe payment routes registered');
  console.log('- Webhook endpoints: /webhook and /stripe-webhook');
}

// Import mock payment functions for fallback mode
const { createMockCheckoutSession, verifyMockPayment } = require('./stripe-integration');

module.exports = {
  createCheckoutSession,
  verifyPaymentStatus,
  handleStripeWebhook,
  registerStripeRoutes
};

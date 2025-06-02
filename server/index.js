const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Import Stripe payment handler
const { 
  createCheckoutSession, 
  verifyPaymentStatus 
} = require('./stripe-payment-handler');

// Import Stripe test routes
const { addStripeRoutes } = require('./stripe-routes');

// Import FAQ email route
const faqEmailRoute = require('./routes/faq-email-route');

// Load environment variables
const result = dotenv.config();
console.log('Dotenv config result:', result.error ? 'Error loading .env file' : '.env file loaded successfully');

// If dotenv failed or variables aren't set, use manual setup
const { setupEnvironmentVariables } = require('./manual-env-setup');
setupEnvironmentVariables(); // Apply the environment variables directly

// Debug: Print all environment variables relevant to Stripe (with sensitive parts masked)
console.log('Environment variables loaded (after manual setup):');
console.log('- USE_FALLBACK_MODE:', process.env.USE_FALLBACK_MODE);
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 
  `${process.env.STRIPE_SECRET_KEY.substring(0, 5)}...${process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 5)}` : 'not set');
console.log('- STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 
  `${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 5)}...${process.env.STRIPE_PUBLISHABLE_KEY.substring(process.env.STRIPE_PUBLISHABLE_KEY.length - 5)}` : 'not set');
console.log('- PORT:', process.env.PORT || '3001 (default)');

// Initialize express app
const app = express();

// Enhanced CORS configuration with better debugging
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ezvep.com',
  'https://www.ezvep.com',
  // Add any additional domains here
];

// Debug incoming requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`Incoming request from origin: ${origin || 'unknown'} to ${req.method} ${req.url}`);
  next();
});

// Import Stripe handler early to ensure availability
const stripeHandler = require('./stripe-payment-handler');

// Register Stripe payment routes early to ensure they're available
console.log('Registering Stripe payment routes early...');
stripeHandler.registerStripeRoutes(app);

// Add body parser for direct API endpoints
app.use('/direct-api', express.json());

// Add OPTIONS handler for the direct endpoint
app.options('/direct-api/create-checkout-session', (req, res) => {
  // Set CORS headers for preflight request
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

// Direct API endpoint with explicit CORS
app.post('/direct-api/create-checkout-session', express.json(), async (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const session = await stripeHandler.createCheckoutSession(req.body);
    res.status(200).json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Enable CORS for all routes with enhanced configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log(`Checking if origin ${origin} is allowed`);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`Origin ${origin} not in allowed list:`, allowedOrigins);
      // For development, allow all origins but log a warning
      // For production, you might want to be strict
      return callback(null, true); // Allow all origins in development
    }
    console.log(`Origin ${origin} is allowed`);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// IMPORTANT: Raw body parser for Stripe webhooks must come BEFORE JSON parsers
// We need to set up webhook routes first to ensure they receive the raw body
// Webhooks need raw body for signature verification

// Set up a special raw body parser for Stripe webhook routes only
app.post('/webhook', express.raw({ type: 'application/json' }));
app.post('/stripe-webhook', express.raw({ type: 'application/json' }));

// Now we can safely use the regular JSON parser for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook' || req.originalUrl === '/stripe-webhook') {
    next(); // Skip JSON parsing for webhook routes
  } else {
    express.json()(req, res, next); // Parse JSON for all other routes
  }
});

app.use(express.urlencoded({ extended: true }));

// Serve static files from the server directory
app.use(express.static(path.join(__dirname)));
console.log('Serving static files from:', path.join(__dirname));
console.log('Static file directory:', __dirname);

// Set up nodemailer transporter
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Make the transporter available to routes
  app.set('emailTransporter', transporter);
}

// Debug environment variables
console.log('Environment variables:');
console.log('GOOGLE_PLACES_API_KEY exists:', process.env.GOOGLE_PLACES_API_KEY ? 'Yes' : 'No');
console.log('GOOGLE_PLACE_ID:', process.env.GOOGLE_PLACE_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());

// Debug Stripe-specific environment variables
console.log('Stripe configuration:');
console.log('- Secret Key exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('- Publishable Key exists:', !!process.env.STRIPE_PUBLISHABLE_KEY);
console.log('- USE_FALLBACK_MODE:', process.env.USE_FALLBACK_MODE);
console.log('- USE_FALLBACK_MODE parsed as boolean:', process.env.USE_FALLBACK_MODE === 'true');

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ message: 'Server is working correctly!', timestamp: new Date().toISOString() });
});

// Use the FAQ email route
// Note: This replaces the previous /api/submit-faq-download endpoint
// The new implementation uses Google Apps Script for spreadsheet integration
// instead of direct Google Sheets API via Google Cloud service account
app.use(faqEmailRoute);

// Stripe test endpoint for debugging
app.get('/api/test-stripe', async (req, res) => {
  console.log('Stripe test endpoint called');
  try {
    // Get Stripe secret key from environment
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    console.log('Test endpoint - API credentials:')
    console.log(`Secret Key: ${secretKey ? secretKey.substring(0, 5) + '...' : 'missing'}`);
    
    if (!secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing Stripe credentials' 
      });
    }
    
    // Initialize Stripe with the secret key
    const stripe = require('stripe')(secretKey);
    
    // Get API version to test connection
    const apiVersion = await stripe.apiVersion;
    
    return res.status(200).json({
      success: true,
      message: 'Stripe API connection successful',
      api_version: apiVersion
    });
  } catch (error) {
    console.error('Test endpoint error:', error.message);
    console.error('Error type:', typeof error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error connecting to Stripe API',
      error: error.message 
    });
  }
});

// Manual reviews endpoint - reads from local JSON file
app.get('/api/manual-reviews', (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Read reviews from JSON file
    const fs = require('fs');
    const path = require('path');
    const reviewsPath = path.join(__dirname, 'data', 'reviews.json');
    
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews file not found' });
    }
    
    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
    
    // Process dates to ensure they're in the right format
    if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
      reviewsData.reviews = reviewsData.reviews.map(review => {
        // Convert ISO date string to timestamp if needed
        if (typeof review.time === 'string') {
          review.time = new Date(review.time).getTime();
        }
        return review;
      });
    }
    
    console.log(`Serving ${reviewsData.reviews?.length || 0} manual reviews`);
    return res.json(reviewsData);
  } catch (error) {
    console.error('Error reading manual reviews:', error);
    return res.status(500).json({ error: 'Failed to read manual reviews', message: error.message });
  }
});

// Google Reviews API endpoint
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Google Places API endpoint
app.get('/api/google-reviews', async (req, res) => {
  try {
    // Enable CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Get the Place ID from request query or use default
    const placeId = req.query.placeId || process.env.GOOGLE_PLACE_ID || 'ChIJ88pp-7EZtE0RttmdZtbpdMc'; // Using same Place ID as frontend
    console.log('Using Place ID:', placeId);
    
    // Google Places API key (store this in .env file)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    // Use mock data if no API key is provided (for development)
    if (!apiKey) {
      console.log('No API key found - using mock data');
      // Return mock data
      const mockData = {
        name: "EZVEP",
        averageRating: 4.8,
        totalReviews: 5,
        reviews: [
          {
            author_name: "Sarah L.",
            rating: 5,
            text: "Fantastic service! Made the VEP application process so easy. Highly recommend!",
            time: Date.now() - 2 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Sarah+L&background=random"
          },
          {
            author_name: "Michael T.",
            rating: 4,
            text: "Good experience. Fast turnaround and helpful customer service.",
            time: Date.now() - 10 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Michael+T&background=random"
          },
          {
            author_name: "David K.",
            rating: 5,
            text: "Very professional service. They handled everything for me and the RFID tag was delivered quickly. Will use again next time!",
            time: Date.now() - 15 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=David+K&background=random"
          },
          {
            author_name: "Linda P.",
            rating: 5,
            text: "Excellent service! They made the whole process very smooth and stress-free.",
            time: Date.now() - 30 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Linda+P&background=random"
          },
          {
            author_name: "Jason R.",
            rating: 4,
            text: "Great service, very responsive to queries. Would recommend.",
            time: Date.now() - 45 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Jason+R&background=random"
          }
        ]
      };
      return res.json(mockData);
    }
    
    console.log('Making request to Google Places API...');
    // Construct Google Places Details API URL - request more fields
    const placesResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        key: apiKey,
        // Use default port configuration
        fields: 'reviews(author_name,rating,text,time,profile_photo_url),rating,user_ratings_total',
        reviews_no_translations: true,
        reviews_sort: 'newest',
        // Request maximum number of reviews
        reviews_limit: 20
      }
    });
    
    // Log raw response for debugging
    console.log('Raw API response:', JSON.stringify(placesResponse.data, null, 2).substring(0, 1000) + '...');
    
    console.log('Google Places API Response Status:', placesResponse.status);
    
    // Check for API errors
    if (placesResponse.data.status !== 'OK') {
      console.error('Google Places API error:', placesResponse.data.status, placesResponse.data.error_message);
      return res.status(400).json({ error: 'Google Places API error', message: placesResponse.data.error_message || placesResponse.data.status });
    }

    // Extract reviews data
    const { result } = placesResponse.data;
    
    if (!result) {
      console.error('No result found in API response');
      return res.status(404).json({ error: 'No reviews found for this place ID' });
    }
    
    console.log('Result contains reviews?', !!result.reviews);
    if (result.reviews) {
      console.log('Number of reviews:', result.reviews.length);
    }
    
    // Log all available fields from the result
    console.log('Available fields in result:', Object.keys(result));
    
    // Log the first review to understand the structure
    if (result.reviews && result.reviews.length > 0) {
      console.log('First review sample structure:', JSON.stringify(result.reviews[0], null, 2));
    }
    
    // Check if we have reviews
    if (!result.reviews || result.reviews.length === 0) {
      console.log('No reviews found in the API response. Using mock data instead.');
      
      // Use mock data when no reviews are available from API
      const mockData = {
        name: result.name || "EZVEP",
        averageRating: result.rating || 4.8,
        totalReviews: result.user_ratings_total || 5,
        reviews: [
          {
            author_name: "Sarah L.",
            rating: 5,
            text: "Fantastic service! Made the VEP application process so easy. Highly recommend!",
            time: Date.now() - 2 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Sarah+L&background=random"
          },
          {
            author_name: "Michael T.",
            rating: 4,
            text: "Good experience. Fast turnaround and helpful customer service.",
            time: Date.now() - 10 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Michael+T&background=random"
          },
          {
            author_name: "David K.",
            rating: 5,
            text: "Very professional service. They handled everything for me and the RFID tag was delivered quickly. Will use again next time!",
            time: Date.now() - 15 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=David+K&background=random"
          },
          {
            author_name: "Linda P.",
            rating: 5,
            text: "Excellent service! They made the whole process very smooth and stress-free.",
            time: Date.now() - 30 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Linda+P&background=random"
          },
          {
            author_name: "Jason R.",
            rating: 4,
            text: "Great service, very responsive to queries. Would recommend.",
            time: Date.now() - 45 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Jason+R&background=random"
          }
        ]
      };
      
      return res.json(mockData);
    } else {
      // Format and send the real reviews
      // Process reviews to add image URLs where available
      const processedReviews = result.reviews.map(review => {
        // Check if review has photos
        if (review.photos && review.photos.length > 0) {
          return {
            ...review,
            review_image_url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${review.photos[0].photo_reference}&key=${apiKey}`
          };
        }
        return review;
      });
      
      const formattedResponse = {
        name: result.name || 'Business',
        averageRating: result.rating || 0,
        totalReviews: result.user_ratings_total || (result.reviews ? result.reviews.length : 0),
        reviews: processedReviews || []
      };
      
      console.log(`Returning ${formattedResponse.reviews.length} real reviews`);
      return res.json(formattedResponse);
    }
    
  } catch (error) {
    console.error('Error fetching Google reviews:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    return res.status(500).json({ 
      error: 'Failed to fetch Google reviews',
      message: error.message 
    });
  }
});

// API response helpers have been moved to stripe-payment-handler.js

// Serve a simple test page for Airwallex payment flow
app.get('/server-payment-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Server-Side Payment Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>Server-Side Payment Test</h1>
      <p>This page tests the Airwallex payment flow without using the client-side SDK.</p>
      
      <div class="card">
        <h2>Create Payment</h2>
        <p>Click the button below to initiate a test payment:</p>
        <form action="/api/create-payment-url" method="POST">
          <input type="hidden" name="amount" value="1.00">
          <input type="hidden" name="currency" value="SGD">
          <input type="hidden" name="name" value="Test Customer">
          <input type="hidden" name="email" value="test@example.com">
          <button type="submit">Create $1.00 Test Payment</button>
        </form>
      </div>
      
      <div class="card">
        <h2>Documentation</h2>
        <p>To use this server-side payment flow in your frontend code:</p>
        <pre>
// Replace client-side SDK with a direct form submission or fetch request
const response = await fetch('/api/create-payment-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1.00,
    currency: 'SGD',
    customerInfo: {
      name: 'Customer Name',
      email: 'customer@example.com'
    }
  })
});

const { success, paymentUrl } = await response.json();

// Redirect to the payment URL
if (success && paymentUrl) {
  window.location.href = paymentUrl;
}
        </pre>
      </div>
    </body>
    </html>
  `);
});

// Mock payment page for development testing
app.get('/mock-payment', (req, res) => {
  const { amount, currency, orderId, customerName, returnUrl } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Payment Page</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .success { background: #52c41a; }
        .error { background: #f5222d; }
        h1, h2 { color: #333; }
        .detail { text-align: left; margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Mock Payment Page</h1>
      <div class="card">
        <h2>Order Details</h2>
        <p><strong>Amount:</strong> ${amount || '1.00'} ${currency || 'SGD'}</p>
        <p><strong>Order ID:</strong> ${orderId || 'mock_order'}</p>
        <p><strong>Customer:</strong> ${customerName || 'Test Customer'}</p>
        
        <div class="detail">
          <p>This is a mock payment page for development testing.</p>
          <p>In a real implementation, users would enter their card details here.</p>
        </div>
        
        <button class="success" onclick="window.location.href='${returnUrl || '/payment-result'}?status=success&order_id=${orderId || 'mock_order'}'">
          Simulate Successful Payment
        </button>
        
        <button class="error" onclick="window.location.href='${returnUrl || '/payment-result'}?status=failed&order_id=${orderId || 'mock_order'}'">
          Simulate Failed Payment
        </button>
      </div>
    </body>
    </html>
  `);
});

// Payment result page
app.get('/payment-result', (req, res) => {
  const { status, order_id } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Result</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .success { color: #52c41a; }
        .error { color: #f5222d; }
        .card { border: 1px solid #eee; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        button { padding: 10px 15px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1 class="${status === 'success' ? 'success' : 'error'}">
          ${status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        <p><strong>Order ID:</strong> ${order_id || 'Unknown'}</p>
        <p>${status === 'success' ? 'Thank you for your purchase!' : 'Please try again or contact support.'}</p>
        
        <button onclick="window.location.href='/server-payment-test'">
          Return to Test Page
        </button>
      </div>
    </body>
    </html>
  `);
});

// Test endpoint for Airwallex authentication
app.get('/api/test-airwallex-auth', async (req, res) => {
  try {
    // Get API credentials
    const apiKey = process.env.AIRWALLEX_API_KEY;
    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    
    if (!apiKey || !clientId) {
      return res.status(400).json({
        success: false, 
        message: 'Missing Airwallex API credentials',
        env: {
          client_id_set: !!process.env.AIRWALLEX_CLIENT_ID,
          api_key_set: !!process.env.AIRWALLEX_API_KEY,
          env: process.env.AIRWALLEX_ENV || 'not set'
        }
      });
    }
    
    console.log('Test auth - Client ID length:', clientId.length);
    console.log('Test auth - API Key length:', apiKey.length);
    console.log('Test auth - Client ID first/last 5 chars:', `${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)}`);
    
    // Try to authenticate
    const authResponse = await axios.post('https://api-demo.airwallex.com/api/v1/authentication/login', {}, {
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (authResponse.data && authResponse.data.token) {
      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token_received: true
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Authentication response did not contain token',
        response: authResponse.data
      });
    }
  } catch (error) {
    console.error('Test auth error:', error.response ? error.response.data : error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication test failed',
      error: error.response ? error.response.data : error.message
    });
  }
});

// Legacy payment endpoint - redirects to Stripe checkout
app.post('/api/create-payment-intent', async (req, res) => {
  console.log('Legacy payment endpoint called - redirecting to Stripe checkout');
  try {
    // Get the request data
    const { amount, currency, customerInfo } = req.body;
    console.log(`Payment requested: ${amount} ${currency}`);
    
    if (!amount || !currency) {
      return res.status(400).json({ success: false, message: 'Amount and currency are required' });
    }
    
    // Format the request to match what our Stripe handler expects
    const stripeData = {
      amount: amount,
      currency: currency.toLowerCase(),
      customerName: customerInfo?.name || 'Guest',
      customerEmail: customerInfo?.email || '',
      productName: 'DIY VEP E-Guide',
      description: 'Step-by-step guide for DIY VEP application',
      // Add dynamic success/cancel URLs based on request origin
      successUrl: `${req.protocol}://${req.get('host')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${req.protocol}://${req.get('host')}/payment-cancel`,
      metadata: {
        source: 'legacy_endpoint',
        customer_name: customerInfo?.name || 'Guest',
        customer_email: customerInfo?.email || ''
      }
    };
    
    // Call our Stripe checkout session creation function from the handler
    try {
      const checkoutSession = await stripeHandler.createCheckoutSession(stripeData);
      
      // Map the response to match what the old clients expect
      return res.status(200).json({
        success: true,
        redirectUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
        // Include these fields for backward compatibility
        clientSecret: checkoutSession.id, // Not a real client secret but keeps the format consistent
        intentId: checkoutSession.id
      });
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create checkout session',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in legacy payment endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      error: error.message
    });
  }
});
// Payment success handling endpoint
app.post('/api/payment-success', async (req, res) => {
  try {
    const { sessionId, customerInfo } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Stripe session ID is required'
      });
    }
    
    console.log(`Processing payment success for session: ${sessionId}`);
    
    try {
      // Use the Stripe payment handler to verify the payment status
      const paymentStatus = await stripeHandler.verifyPaymentStatus(sessionId);
      
      if (paymentStatus.status === 'complete' || paymentStatus.status === 'paid') {
        // Process successful payment
        return processSuccessfulPayment(res, sessionId, customerInfo, paymentStatus);
      } else {
        console.log(`Payment not completed. Status: ${paymentStatus.status}`);
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Status: ${paymentStatus.status}`,
          status: paymentStatus.status
        });
      }
    } catch (verifyError) {
      console.error('Error verifying payment with Stripe:', verifyError.message);
      
      // For development only - in production, don't automatically assume success
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode: Proceeding with payment despite verification error');
        return processSuccessfulPayment(res, sessionId, customerInfo);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error verifying payment status',
        error: verifyError.message
      });
    }
  } catch (error) {
    console.error('Error processing payment verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment status'
    });
  }
});

// Helper function to process a successful payment
async function processSuccessfulPayment(res, sessionId, customerInfo, paymentData = null) {
  console.log(`Processing successful payment for Stripe session: ${sessionId}`);
  console.log('Customer info:', customerInfo);
  
  // Send confirmation email
  if (transporter && customerInfo?.email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: 'Your DIY VEP E-Guide Purchase Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e186a;">Hello ${customerInfo.name || 'there'},</h2>
          <p>Thank you for purchasing our DIY VEP E-Guide!</p>
          <p>Your payment has been successfully processed.</p>
          <p>Attached to this email, you'll find your complete DIY VEP E-Guide with step-by-step instructions, screenshots, and insider tips to make your application process smooth and hassle-free.</p>
          <p>If you have any questions, feel free to reply to this email or contact us via WhatsApp.</p>
          <p>Best regards,<br>The EZVEP Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'EZVEP-DIY-VEP-Guide.pdf',
          path: path.join(__dirname, 'data', 'EZVEP-DIY-VEP-Guide.pdf')
        }
      ]
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Confirmation email sent to ${customerInfo.email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue processing even if email fails
    }
  }
  
  return res.status(200).json({
    success: true,
    message: 'Payment processed successfully',
    paymentData: process.env.NODE_ENV === 'development' ? paymentData : undefined
  });
}

// Load Google Sheets integration
const googleSheets = require('./utils/google-sheets');

// Submit email for free FAQ download
app.post('/api/submit-faq-download', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    
    // Store in local JSON file as backup
    const dataPath = path.join(__dirname, 'data', 'faq-subscribers.json');
    let subscribers = [];
    
    // Check if file exists and read current data
    if (fs.existsSync(dataPath)) {
      subscribers = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    // Add new subscriber with timestamp
    const newSubscriber = {
      name,
      email,
      phone: phone || '',
      timestamp: new Date().toISOString()
    };
    
    subscribers.push(newSubscriber);
    
    // Save updated subscribers list locally
    fs.writeFileSync(dataPath, JSON.stringify(subscribers, null, 2));
    
    // Send to Google Sheets if configured
    // Get spreadsheet ID from environment variable
    const spreadsheetId = process.env.GOOGLE_SHEETS_FAQ_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_FAQ_SHEET_NAME || 'VEP FAQ Downloads';
    
    if (spreadsheetId) {
      try {
        await googleSheets.addFormSubmission(
          newSubscriber, 
          spreadsheetId,
          sheetName
        );
        console.log('Successfully added submission to Google Sheets');
      } catch (sheetError) {
        console.error('Error saving to Google Sheets:', sheetError);
        // Continue with the process even if Google Sheets fails
      }
    } else {
      console.log('Google Sheets integration not configured, skipping');
    }
    
    // Send email with the free FAQ guide
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Free VEP FAQ Guide',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2e186a;">Hello ${name},</h2>
            <p>Thank you for downloading our free VEP FAQ guide!</p>
            <p>Attached to this email, you'll find the guide with answers to the most common questions about applying for a VEP to enter Malaysia.</p>
            <p>While this guide covers the basics, our complete DIY VEP E-Guide offers step-by-step instructions, screenshots, and insider tips to make your application process smooth and hassle-free.</p>
            <p><a href="https://www.ezvep.com/checkout" style="background-color: #2e186a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Upgrade to the Complete Guide</a></p>
            <p>If you have any questions, feel free to reply to this email or contact us via WhatsApp.</p>
            <p>Best regards,<br>The EZVEP Team</p>
          </div>
        `,
        attachments: [
          {
            filename: 'EZVEP-Free-FAQ-Guide.pdf',
            path: path.join(__dirname, 'data', 'EZVEP-Free-FAQ-Guide.pdf')
          }
        ]
      };
      
      await transporter.sendMail(mailOptions);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Submission successful! Check your email for the free guide.'
    });
  } catch (error) {
    console.error('Error processing FAQ download submission:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.'
    });
  }
});

// Basic server info route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ message: 'Server is working correctly!', timestamp: new Date().toISOString() });
});

// Log Stripe credentials on startup (for debugging)
console.log('Stripe configuration:');
console.log('- Secret Key exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('- Publishable Key exists:', !!process.env.STRIPE_PUBLISHABLE_KEY);

// Register Stripe routes
addStripeRoutes(app);

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const result = await createCheckoutSession(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Payment status verification endpoint
app.get('/api/payment-status', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    const result = await verifyPaymentStatus(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error verifying payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Server configured to use port from environment or default

// Direct test endpoint for Stripe
app.get('/stripe-test-direct', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Stripe Test - Direct</title>
    </head>
    <body>
      <h1>Stripe Test Page</h1>
      <p>This is a direct test page served by the Express server.</p>
      <p>Current time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// Simple test endpoint to verify static file serving
app.get('/simple-test', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, 'simple-test.html');
  console.log('Serving simple test page from:', filePath);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving simple test page:', err);
      res.status(500).send('Error serving test page: ' + err.message);
    } else {
      console.log('Successfully served simple test page');
    }
  });
});

// Manually serve Stripe test page
app.get('/stripe-test-manual', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, 'stripe-test.html');
  console.log('Manually serving Stripe test page from:', filePath);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error manually serving Stripe test page:', err);
      res.status(500).send('Error serving Stripe test page: ' + err.message);
    } else {
      console.log('Successfully served Stripe test page manually');
    }
  });
});

// Direct embedded Stripe test page
app.get('/stripe-direct', (req, res) => {
  console.log('Serving direct Stripe test page');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EZVEP Stripe Direct Test</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #4f46e5; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #4f46e5; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; }
        .error { background: #fee2e2; border-color: #fca5a5; }
      </style>
    </head>
    <body>
      <h1>EZVEP Stripe Direct Test</h1>
      <p>Use this form to test the Stripe payment integration directly.</p>
      
      <div class="form-group">
        <label for="amount">Amount (SGD)</label>
        <input type="number" id="amount" value="47.00" step="0.01" min="1">
      </div>
      
      <div class="form-group">
        <label for="name">Customer Name</label>
        <input type="text" id="name" value="Test Customer">
      </div>
      
      <div class="form-group">
        <label for="email">Customer Email</label>
        <input type="email" id="email" value="test@example.com">
      </div>
      
      <button id="checkoutBtn">Create Checkout Session</button>
      
      <div id="result" class="result" style="display: none;"></div>
      
      <script>
        document.getElementById('checkoutBtn').addEventListener('click', async () => {
          const amount = document.getElementById('amount').value;
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const resultEl = document.getElementById('result');
          
          try {
            resultEl.className = 'result';
            resultEl.innerHTML = 'Creating checkout session...';
            resultEl.style.display = 'block';
            
            const response = await fetch('/api/create-checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount,
                currency: 'sgd',
                productName: 'DIY VEP E-Guide',
                description: 'Step-by-step guide for DIY Visa Extension Pass application',
                customerName: name,
                customerEmail: email,
                successUrl: window.location.origin + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl: window.location.origin + '/payment-cancel'
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              resultEl.innerHTML = 
                '<p>Checkout session created successfully!</p>' +
                '<p>Session ID: ' + data.id + '</p>' +
                '<p><a href="' + data.url + '" target="_blank" style="display:inline-block; margin-top:10px; padding:8px 12px; background:#22c55e; color:white; text-decoration:none; border-radius:4px;">Proceed to Payment</a></p>';
              // window.location.href = data.url; // Uncomment to auto-redirect
            } else {
              throw new Error(data.error || 'Failed to create checkout session');
            }
          } catch (error) {
            resultEl.className = 'result error';
            resultEl.innerHTML = '<p>Error: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Serve the new Stripe test page
app.get('/stripe-test-new', (req, res) => {
  const filePath = path.join(__dirname, 'stripe-test-page.html');
  console.log('Serving new Stripe test page from:', filePath);
  
  // Check if the file exists before trying to send it
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File ${filePath} does not exist:`, err);
      return res.status(404).send(`File not found: ${filePath}. Error: ${err.message}`);
    }
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving new Stripe test page:', err);
        res.status(500).send('Error serving new Stripe test page: ' + err.message);
      } else {
        console.log('Successfully served new Stripe test page');
      }
    });
  });
});

// Add additional Stripe test routes (these are separate from the main payment routes)
console.log('Registering additional Stripe test routes...');
addStripeRoutes(app);

// Add route for the comprehensive UAT testing page
app.get('/stripe-uat', (req, res) => {
  const filePath = path.join(__dirname, 'stripe-uat-test.html');
  
  if (fs.existsSync(filePath)) {
    console.log('Serving UAT test page from:', filePath);
    res.sendFile(filePath);
  } else {
    res.status(404).send('UAT test page file not found: ' + filePath);
  }
});

// Add routes for payment success and cancel pages
app.get('/payment-success', (req, res) => {
  const filePath = path.join(__dirname, 'payment-success.html');
  
  if (fs.existsSync(filePath)) {
    console.log('Serving payment success page, session ID:', req.query.session_id);
    res.sendFile(filePath);
  } else {
    res.status(404).send('Payment success page not found');
  }
});

app.get('/payment-cancel', (req, res) => {
  const filePath = path.join(__dirname, 'payment-cancel.html');
  
  if (fs.existsSync(filePath)) {
    console.log('Serving payment cancel page');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Payment cancel page not found');
  }
});

// Add route for payment dashboard (admin use)  
app.get('/payment-dashboard', (req, res) => {
  // In production, you should add authentication here
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.log('WARNING: Accessing payment dashboard in production - authentication should be implemented');
  }
  
  const filePath = path.join(__dirname, 'payment-dashboard.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Payment dashboard page not found');
  }
});

// Document available test pages and routes for UAT
const uatRoutes = [
  { path: '/stripe-uat', description: 'Comprehensive UAT test page with multiple scenarios (RECOMMENDED)' },
  { path: '/stripe-direct', description: 'Simple direct Stripe Checkout test page' },
  { path: '/stripe-test', description: 'Standard Stripe test page' },
  { path: '/mock-payment', description: 'Mock payment page (only works in fallback mode)' },
  { path: '/api/create-checkout-session', description: 'API endpoint for creating checkout sessions' },
  { path: '/api/payment-status', description: 'API endpoint for verifying payment status' },
  { path: '/payment-success', description: 'Success page after payment completion' },
  { path: '/payment-cancel', description: 'Cancel page if payment is abandoned' },
  { path: '/payment-dashboard', description: 'Admin dashboard for payment monitoring (requires auth in production)' }
];

// Start the server with explicit binding to 127.0.0.1 which is more reliable in Windows
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log('\n======== AVAILABLE UAT TEST ROUTES ========');
  uatRoutes.forEach(route => {
    console.log(`📝 ${route.path.padEnd(30)} - ${route.description}`);
  });
  console.log('\n📌 FOR UAT TESTING: Open http://localhost:3001/stripe-uat');
  console.log('\n🔑 STRIPE MODE:', process.env.USE_FALLBACK_MODE === 'true' ? 'FALLBACK (Mock)' : 'LIVE (Real API)');
});

// Add error handling for the server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error('Server error:', error.message);
  }
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const path = require('path');

// Import the same payment processing function if available
let processPaymentSuccess;
try {
  const stripeHandler = require('../server/stripe-payment-handler');
  processPaymentSuccess = stripeHandler.processPaymentSuccess;
} catch (err) {
  console.log('Could not import processPaymentSuccess function, will use inline implementation');
  // Define a simple version if the import fails
  processPaymentSuccess = async (session, transporter) => {
    try {
      console.log('Processing payment success for session:', session.id);
      
      // Send fulfillment email
      if (session.customer_details && session.customer_details.email) {
        await transporter.sendMail({
          from: '"EZ VEP" <info@ezvep.com>',
          to: session.customer_details.email,
          subject: 'Your DIY VEP Guide Purchase',
          text: `Thank you for your purchase! Your guide is attached.`,
          html: `<p>Thank you for your purchase! Your guide is attached.</p>`,
          attachments: [
            {
              filename: 'DIY_VEP_Guide.pdf',
              path: path.join(process.cwd(), 'assets', 'DIY_VEP_Guide.pdf'),
            },
          ],
        });
        console.log('Sent fulfillment email to:', session.customer_details.email);
      }
    } catch (err) {
      console.error('Error in processPaymentSuccess:', err);
    }
  };
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

module.exports = async (req, res) => {
  // Set CORS headers for preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Get the raw body as a buffer
    const rawBody = await new Promise((resolve) => {
      let bodyChunks = [];
      req.on('data', (chunk) => bodyChunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(bodyChunks)));
    });
    
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received webhook event:', event.type);

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment successful for session:', session.id);
    
    try {
      // Process the successful payment (send email, update database, etc.)
      const transporter = createTransporter();
      await processPaymentSuccess(session, transporter);
      console.log('Successfully processed payment for session:', session.id);
    } catch (err) {
      console.error('Error processing payment:', err);
      // We don't want to return an error status here as we've already received the webhook
      // Just log the error and continue
    }
  }

  // Return a success response to Stripe
  return res.status(200).json({ received: true });
};

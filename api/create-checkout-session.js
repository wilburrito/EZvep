const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received checkout request:', req.body);
    const { 
      customer_email, 
      customer_name, 
      product_name, 
      product_price, 
      currency, 
      order_id, 
      success_url, 
      cancel_url 
    } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'sgd',
            product_data: {
              name: product_name || 'DIY VEP Guide',
            },
            unit_amount: Math.round((product_price || 47.00) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${req.headers.origin || 'https://www.ezvep.com'}?success=true`,
      cancel_url: cancel_url || `${req.headers.origin || 'https://www.ezvep.com'}?canceled=true`,
      customer_email: customer_email,
      metadata: {
        order_id: order_id,
        product_name: product_name,
        customer_name: customer_name
      },
    });

    console.log('Created checkout session:', session.id);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: err.message });
  }
};

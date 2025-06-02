/**
 * Email Fulfillment Handler for Stripe Payments
 * 
 * This module handles email delivery for digital products purchased through Stripe.
 */
const path = require('path');
const fs = require('fs');

/**
 * Send the DIY VEP E-Guide to customer after successful payment
 * 
 * @param {Object} session - Stripe checkout session data
 * @param {Object} transporter - Nodemailer transport
 * @returns {Promise} - Email delivery result
 */
async function fulfilDiyVepGuide(session, transporter) {
  try {
    if (!transporter) {
      throw new Error('Email transport not configured');
    }

    // Extract customer information from session
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 
                        session.metadata?.customer_name || 
                        'Valued Customer';
    
    if (!customerEmail) {
      throw new Error('Customer email not found in checkout session');
    }
    
    console.log(`Preparing to send DIY VEP E-Guide to ${customerEmail} (${customerName})`);
    
    // Create a unique order reference for tracking
    const orderRef = `ORDER-${session.id.substring(0, 8)}`;
    
    // Path to the E-Guide PDF
    const guidePath = path.join(process.cwd(), 'data', 'EZVEP-DIY-VEP-Guide.pdf');
    
    // Verify the file exists
    if (!fs.existsSync(guidePath)) {
      throw new Error(`E-Guide PDF file not found at: ${guidePath}`);
    }
    
    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: 'Your DIY VEP E-Guide - Thank You For Your Purchase',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e186a;">Thank You, ${customerName}!</h2>
          <p>Your purchase of the DIY VEP E-Guide is complete.</p>
          <p><strong>Order Reference:</strong> ${orderRef}</p>
          <p>The complete guide is attached to this email. Here's what you'll find inside:</p>
          <ul>
            <li>Step-by-step instructions for the entire VEP application process</li>
            <li>Screenshots to guide you through each stage</li>
            <li>Tips for avoiding common mistakes</li>
            <li>What to expect at the JPJ counter</li>
            <li>Troubleshooting advice for potential issues</li>
          </ul>
          <p>If you have any questions about the guide or need further assistance, don't hesitate to contact us.</p>
          <p>Best regards,<br>The EZVEP Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated email sent following your purchase. Your payment has been processed securely through Stripe.
            Order ID: ${session.id}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'EZVEP-DIY-VEP-Guide.pdf',
          path: guidePath
        }
      ]
    };
    
    // Send the email with guide attached
    const result = await transporter.sendMail(mailOptions);
    
    // Log the successful fulfillment
    console.log(`DIY VEP E-Guide sent to ${customerEmail} (Order: ${orderRef})`);
    
    // Return success details
    return {
      success: true,
      orderId: session.id,
      orderRef: orderRef,
      recipient: customerEmail,
      messageId: result.messageId,
      fulfillmentMethod: 'email',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error fulfilling DIY VEP E-Guide order:', error);
    return {
      success: false,
      error: error.message,
      orderId: session?.id,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Log fulfillment details to a file for record-keeping
 * 
 * @param {Object} fulfillmentResult - Result of the fulfillment operation
 */
function logFulfillment(fulfillmentResult) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'order-fulfillment.log');
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(fulfillmentResult)}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error('Error logging fulfillment:', error);
  }
}

/**
 * Process a successful payment and fulfill the order based on product type
 * 
 * @param {Object} session - Stripe checkout session
 * @param {Object} transporter - Nodemailer transport
 * @returns {Object} Fulfillment result
 */
async function processPaymentSuccess(session, transporter) {
  try {
    console.log('Processing payment success for session:', session.id);
    console.log('Payment status:', session.payment_status);
    console.log('Session metadata:', JSON.stringify(session.metadata || {}));
    
    // Log customer details
    if (session.customer_details) {
      console.log('Customer email:', session.customer_details.email);
      console.log('Customer name:', session.customer_details.name);
    }
    
    // Get product information from session
    const productName = session.metadata?.product_name || '';
    const isDiyVepGuideInMetadata = productName.includes('DIY VEP') || 
                          session.metadata?.product_type === 'diy_vep_guide';
    
    console.log('Product identified from metadata?', isDiyVepGuideInMetadata ? 'Yes' : 'No');
    
    // If we can directly identify it's a DIY VEP Guide from metadata
    if (isDiyVepGuideInMetadata) {
      console.log('Identified as DIY VEP Guide from metadata');
      const fulfillmentResult = await fulfilDiyVepGuide(session, transporter);
      logFulfillment(fulfillmentResult);
      return fulfillmentResult;
    }
    
    // If we couldn't identify from metadata, try to check line items
    // This requires an expanded session with line_items from Stripe
    let identifiedFromLineItems = false;
    
    if (session.line_items) {
      console.log('Line items available, checking for DIY VEP Guide...');
      console.log('Line items:', JSON.stringify(session.line_items));
      
      const hasDiyVepGuide = session.line_items.data.some(item => {
        const matchesInDescription = item.description && item.description.includes('DIY VEP');
        const matchesInProduct = item.price && item.price.product && 
                               item.price.product.name && 
                               item.price.product.name.includes('DIY VEP');
        return matchesInDescription || matchesInProduct;
      });
      
      console.log('Product identified from line items?', hasDiyVepGuide ? 'Yes' : 'No');
      
      if (hasDiyVepGuide) {
        console.log('Identified as DIY VEP Guide from line items');
        identifiedFromLineItems = true;
        const fulfillmentResult = await fulfilDiyVepGuide(session, transporter);
        logFulfillment(fulfillmentResult);
        return fulfillmentResult;
      }
    } else {
      console.log('No line items found in session');
    }
    
    // TEMPORARY: For now, let's assume all payments are for the DIY VEP Guide
    // This will ensure no orders are missed while we refine the identification logic
    console.log('IMPORTANT: No product identification matched, but assuming this is a DIY VEP Guide purchase');
    console.log('This is a temporary measure to ensure all orders are fulfilled while we refine the system');
    
    const fulfillmentResult = await fulfilDiyVepGuide(session, transporter);
    logFulfillment(fulfillmentResult);
    return fulfillmentResult;
    
    /* Uncomment this block when proper product identification is implemented
    // If we couldn't find a matching product
    console.log('No recognized product for automatic fulfillment in this order');
    return {
      success: false,
      reason: 'No recognized product for automatic fulfillment',
      orderId: session.id,
      timestamp: new Date().toISOString()
    };
    */
    
  } catch (error) {
    console.error('Error processing payment success:', error);
    return {
      success: false,
      error: error.message,
      orderId: session?.id,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  fulfilDiyVepGuide,
  processPaymentSuccess,
  logFulfillment
};

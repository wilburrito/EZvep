/**
 * Email delivery route for VEP FAQ Guide downloads
 */
const path = require('path');
const express = require('express');
const router = express.Router();

// Create the email route
router.post('/api/send-faq-email', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    
    // Get the transporter from the parent app
    const transporter = req.app.get('emailTransporter');
    
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
            path: path.join(process.cwd(), 'data', 'EZVEP-Free-FAQ-Guide.pdf')
          }
        ]
      };
      
      await transporter.sendMail(mailOptions);
      
      // Log the submission for audit purposes
      console.log(`FAQ guide email sent to ${email} (${name})`);
      
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully!'
      });
    } else {
      throw new Error('Email transport not configured');
    }
  } catch (error) {
    console.error('Error sending FAQ email:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the email.'
    });
  }
});

module.exports = router;

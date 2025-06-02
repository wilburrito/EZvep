# Using Google Apps Script for EZVEP FAQ Form Submissions

This guide explains how to set up Google Apps Script to handle form submissions from the "Download Free VEP FAQ Guide" form on the EZVEP website.

## Advantages of Apps Script Approach

- No need for Google Cloud project setup
- No service account or API credentials required
- Simple deployment directly from Google Sheets
- Free tier is generous for typical form submission volumes
- Built-in spreadsheet integration

## Setup Steps

### 1. Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/) and create a new spreadsheet
2. Name it something like "EZVEP FAQ Form Submissions"
3. Rename the first sheet to "VEP FAQ Downloads" (optional)
4. Add the following headers in row 1:
   - A: Timestamp
   - B: Name
   - C: Email
   - D: Phone
   - E: Source
   - F: Notes

### 2. Create an Apps Script

1. From your spreadsheet, go to **Extensions** > **Apps Script**
2. This will open the Apps Script editor in a new tab
3. Replace the default code with the content from `google-apps-script.js` in this repository
4. Save the project with a name like "EZVEP FAQ Form Handler"

### 3. Deploy as a Web App

1. In the Apps Script editor, click on **Deploy** > **New deployment**
2. Select **Web app** as the deployment type
3. Configure the web app:
   - Description: "EZVEP FAQ Form Handler"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone" (to allow anonymous form submissions)
4. Click **Deploy**
5. Authorize the app when prompted
6. Copy the Web app URL provided - this is the endpoint your form will submit to

### 4. Update Your Form Submission Code

Update the `onFinish` function in your React component (`src/components/PricingTable/index.tsx`):

```typescript
const onFinish = async (values: any) => {
  setIsSubmitting(true);
  try {
    // URL from your Apps Script deployment
    const appsScriptUrl = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
    
    // Send the form data to the Apps Script web app
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Continue with email sending via your backend
      const emailResponse = await fetch('/api/send-faq-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const emailData = await emailResponse.json();
      
      if (emailData.success) {
        message.success("Thank you! The free VEP FAQ guide will be sent to your email shortly.");
        setIsModalVisible(false);
        form.resetFields();
      } else {
        throw new Error(emailData.message || 'Email sending failed');
      }
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    message.error("There was an error processing your request. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
```

### 5. Create a Backend Email Endpoint

Since the form data is now sent directly to Google Sheets via Apps Script, create a separate endpoint for just sending the email:

```javascript
// In your server/index.js file

// Email endpoint for FAQ guide
app.post('/api/send-faq-email', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
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
      message: 'Email sent successfully!'
    });
  } catch (error) {
    console.error('Error sending FAQ email:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the email.'
    });
  }
});
```

## Testing the Integration

1. Deploy your updated code
2. Open the EZVEP website and complete the "Download Free VEP FAQ Guide" form
3. Verify that the submission appears in your Google Spreadsheet
4. Check that the email with the guide attachment is sent

## Troubleshooting

- **CORS Issues**: If you encounter CORS errors, make sure your Apps Script includes the `doGet` function that handles preflight requests
- **Deployment Errors**: If the deployment fails, check your Google account permissions
- **Quota Limits**: Be aware of Google Apps Script quotas (though they're generous for typical form submission volumes)
- **Response Delays**: Apps Script executions can sometimes take a few seconds, so add appropriate loading states to your form

## Security Notes

- The Apps Script web app is publicly accessible to allow form submissions
- For added security, consider implementing a simple API key in the request/response
- Regularly review submissions in your spreadsheet to monitor for spam or abuse

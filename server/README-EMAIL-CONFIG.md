# Email Configuration for Free FAQ Guide Delivery

To enable automatic email delivery for the free FAQ guide, add the following variables to your `.env` file:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Important Notes:

1. If you're using Gmail, you'll need to set up an "App Password" for this application, as Google no longer allows direct password authentication from third-party apps.

2. To create an App Password:
   - Go to your Google Account > Security
   - Under "Signing in to Google," select "App passwords" (requires 2-Step Verification to be enabled)
   - Select "Mail" and "Other (Custom name)" from the dropdowns
   - Enter "EZVEP" as the app name
   - Click "Generate" and use the generated password in your .env file

3. Make sure to replace the placeholder PDF file at `server/data/EZVEP-Free-FAQ-Guide.pdf` with your actual VEP FAQ guide.

4. For production use, consider integrating with Google Sheets API using the googleapis package that was installed. This would require additional configuration with Google Cloud Platform.

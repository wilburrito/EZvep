# Google Sheets Integration for EZVEP FAQ Form

This guide explains how to set up Google Sheets integration for the "Download Free VEP FAQ Guide" form on the EZVEP website.

## Overview

When users submit the form to download the free VEP FAQ guide, their information will be:
1. Saved to a local JSON file (as a backup)
2. Added to a Google Spreadsheet for easy management
3. Used to send them an email with the guide

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the Google Sheets API for your project
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

### 2. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter a name for your service account (e.g., "EZVEP FAQ Form")
4. Grant the service account the "Editor" role
5. Complete the setup and create the service account

### 3. Create and Download Service Account Key

1. On the Service Accounts page, click on your new service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format and create the key
5. The key file will be downloaded to your computer

### 4. Set Up the Credentials

1. Rename the downloaded JSON key file to `google-sheets-credentials.json`
2. Place this file in the `server/credentials` directory of your EZVEP project
3. Make sure this file is included in your `.gitignore` to keep it secure

### 5. Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/) and create a new spreadsheet
2. Rename the first sheet to "VEP FAQ Downloads" (or your preferred name)
3. Add the following headers in row 1:
   - A: Timestamp
   - B: Name
   - C: Email
   - D: Phone
   - E: Source
   - F: Notes
4. Share the spreadsheet with your service account email (it ends with `@*.iam.gserviceaccount.com`)
   - Give it "Editor" access

### 6. Update Environment Variables

Add the following to your `.env` file:

```
GOOGLE_SHEETS_FAQ_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_FAQ_SHEET_NAME=VEP FAQ Downloads
```

Get the spreadsheet ID from the URL of your Google Sheet:
- The URL will look like: `https://docs.google.com/spreadsheets/d/[YOUR_SPREADSHEET_ID]/edit`
- Copy the part marked as `[YOUR_SPREADSHEET_ID]`

## Testing the Integration

1. Restart your server after making these changes
2. Submit the "Download Free VEP FAQ Guide" form on the website
3. Check your Google Spreadsheet to verify the submission was recorded
4. Check the server logs for any error messages if the data isn't appearing

## Troubleshooting

- **Permission Errors**: Make sure the service account has Editor access to the spreadsheet
- **Missing Credentials**: Verify the credentials file is in the correct location and properly formatted
- **API Errors**: Ensure the Google Sheets API is enabled in your Google Cloud project
- **Quota Limits**: Be aware of Google Sheets API quotas if you expect high volumes of submissions

## Security Notes

- Keep your service account credentials secure and never commit them to public repositories
- Consider implementing rate limiting on the form to prevent abuse
- Review Google Cloud Platform's security best practices

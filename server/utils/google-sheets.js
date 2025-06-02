const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

/**
 * Google Sheets API integration for storing form submissions
 */
class GoogleSheetsClient {
  constructor() {
    this.initialized = false;
    this.auth = null;
    this.sheetsApi = null;
  }

  /**
   * Initialize the Google Sheets API client
   * @returns {boolean} True if initialization was successful
   */
  async initialize() {
    try {
      // Path to the service account credentials file
      const credentialsPath = path.join(__dirname, '..', 'credentials', 'google-sheets-credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        console.error('Google Sheets credentials file not found at:', credentialsPath);
        return false;
      }

      // Load the service account credentials
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Create a JWT client using the service account credentials
      this.auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      // Initialize the Sheets API
      this.sheetsApi = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Google Sheets client:', error);
      return false;
    }
  }

  /**
   * Append a row to the specified Google Sheet
   * @param {string} spreadsheetId The ID of the spreadsheet
   * @param {string} range The range to append to (e.g., 'Sheet1!A1')
   * @param {Array<string|number>} row Array of values to append as a row
   * @returns {object} Response from the Sheets API
   */
  async appendRow(spreadsheetId, range, row) {
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Sheets client');
      }
    }

    try {
      const response = await this.sheetsApi.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error appending row to Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Add a form submission to Google Sheets
   * @param {object} formData The form data to add
   * @param {string} spreadsheetId The ID of the spreadsheet
   * @param {string} sheetName The name of the sheet to add to
   * @returns {boolean} True if the operation was successful
   */
  async addFormSubmission(formData, spreadsheetId, sheetName = 'Sheet1') {
    try {
      const range = `${sheetName}!A:Z`;
      const timestamp = new Date().toISOString();
      
      // Create a row with form data
      const row = [
        timestamp,
        formData.name || '',
        formData.email || '',
        formData.phone || '',
        formData.source || 'VEP FAQ Download',
        formData.notes || ''
      ];

      await this.appendRow(spreadsheetId, range, row);
      return true;
    } catch (error) {
      console.error('Error adding form submission to Google Sheets:', error);
      return false;
    }
  }
}

module.exports = new GoogleSheetsClient();

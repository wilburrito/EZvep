/**
 * Google Apps Script for handling EZVEP FAQ form submissions
 * 
 * Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this code into the Apps Script editor
 * 4. Deploy as a web app (accessible to anyone, even anonymous)
 * 5. Use the generated web app URL in your form submission
 */

/* global ContentService, SpreadsheetApp, Logger, console */

// The doPost function is called when the web app receives a POST request
function doPost(e) {
  try {
    Logger.log('Received form submission');
    Logger.log('Request parameters: ' + JSON.stringify(e.parameter));
    if (e.postData) {
      Logger.log('Post data: ' + e.postData.contents);
    }
    
    // Try to extract data from different possible formats
    var data = {};
    
    // Check if we have form parameters directly
    if (e.parameter && (e.parameter.name || e.parameter.email)) {
      data = e.parameter;
      Logger.log('Using form parameters directly');
    }
    // Check if we have a JSON field from the form
    else if (e.parameter && e.parameter.json) {
      try {
        data = JSON.parse(e.parameter.json);
        Logger.log('Parsed JSON parameter');
      } catch (jsonError) {
        Logger.log('Error parsing JSON parameter: ' + jsonError);
      }
    }
    // Check if we have POST data as JSON
    else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('Parsed POST data contents');
      } catch (postError) {
        Logger.log('Error parsing POST data: ' + postError);
      }
    }
    
    Logger.log('Extracted data: ' + JSON.stringify(data));
    
    // Validate required fields
    if (!data.name || !data.email) {
      Logger.log('Missing required fields');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Name and email are required fields"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the active spreadsheet and sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("VEP FAQ Downloads") || spreadsheet.getActiveSheet();
    
    // Ensure we have headers in the first row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Source", "Notes"]);
    }
    
    // Prepare the row data
    var timestamp = new Date().toISOString();
    var rowData = [
      timestamp,
      data.name,
      data.email,
      data.phone || "",
      data.source || "VEP FAQ Download",
      data.notes || ""
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Form submission saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error and return an error response
    console.error("Error processing form submission: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error processing your request: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function that can be run directly from the Apps Script editor
 * to verify the script is working correctly
 */
function testAppendRow() {
  var testData = {
    name: "Test User",
    email: "test@example.com",
    phone: "123-456-7890",
    source: "Test Script"
  };
  
  // Get the active spreadsheet and sheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("VEP FAQ Downloads") || spreadsheet.getActiveSheet();
  
  // Ensure we have headers in the first row if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Source", "Notes"]);
  }
  
  // Prepare the row data
  var timestamp = new Date().toISOString();
  var rowData = [
    timestamp,
    testData.name,
    testData.email,
    testData.phone || "",
    testData.source || "VEP FAQ Download",
    testData.notes || ""
  ];
  
  // Append the data to the sheet
  sheet.appendRow(rowData);
  
  Logger.log("Test row added successfully");
}

// This function is required to handle CORS preflight requests
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "The EZVEP FAQ form submission API is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

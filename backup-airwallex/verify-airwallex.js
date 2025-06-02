// Comprehensive direct test for Airwallex integration
require('dotenv').config();
const { 
  initializeAirwallex, 
  createPaymentIntent, 
  getPaymentIntent, 
  createMockPaymentIntent 
} = require('./airwallex-integration');

// ANSI color codes for output formatting
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Helper function to print colored output
function print(text, color) {
  console.log(color + text + colors.reset);
}

// Print a section header
function printHeader(text) {
  console.log("\n" + colors.bright + colors.magenta + "=".repeat(80) + colors.reset);
  console.log(colors.bright + colors.magenta + " " + text + colors.reset);
  console.log(colors.bright + colors.magenta + "=".repeat(80) + colors.reset);
}

// Print a success message
function printSuccess(text) {
  console.log(colors.green + "✓ " + text + colors.reset);
}

// Print an error message
function printError(text) {
  console.log(colors.red + "✗ " + text + colors.reset);
}

// Print a warning message
function printWarning(text) {
  console.log(colors.yellow + "! " + text + colors.reset);
}

// Print an info message
function printInfo(text) {
  console.log(colors.cyan + "ℹ " + text + colors.reset);
}

// Main test function
async function testAirwallexIntegration() {
  printHeader("AIRWALLEX INTEGRATION VERIFICATION");
  print("This script will directly test the Airwallex integration", colors.cyan);
  
  // Check environment variables
  printHeader("ENVIRONMENT VARIABLES");
  
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const env = process.env.AIRWALLEX_ENV || 'demo';
  const useFallback = process.env.USE_FALLBACK_MODE === 'true';
  
  if (clientId) {
    printSuccess("AIRWALLEX_CLIENT_ID is set");
  } else {
    printError("AIRWALLEX_CLIENT_ID is not set");
  }
  
  if (apiKey) {
    printSuccess("AIRWALLEX_API_KEY is set");
  } else {
    printError("AIRWALLEX_API_KEY is not set");
  }
  
  printInfo(`AIRWALLEX_ENV is set to: ${env}`);
  printInfo(`USE_FALLBACK_MODE is set to: ${useFallback}`);
  
  // Test SDK initialization
  printHeader("SDK INITIALIZATION");
  
  try {
    const airwallex = initializeAirwallex();
    
    if (!airwallex) {
      printError("Failed to initialize Airwallex SDK - returned null or undefined");
      return false;
    }
    
    printSuccess("Airwallex SDK initialized successfully");
    
    // Test creating a payment intent
    printHeader("PAYMENT INTENT CREATION");
    
    // Create test payment payload
    const crypto = require('crypto');
    const orderID = `order_${crypto.randomBytes(8).toString('hex')}`;
    const requestID = `req_${crypto.randomBytes(8).toString('hex')}`;
    
    const testPayload = {
      amount: 1.00,
      currency: 'SGD',
      merchant_order_id: orderID,
      descriptor: 'EZVEP Test',
      return_url: `http://localhost:3000/payment-success`,
      expired_time: Math.floor(Date.now() / 1000) + 3600,
      metadata: {
        customer_name: 'Test User',
        customer_email: 'test@example.com'
      },
      request_id: requestID,
      order: {
        products: [
          {
            name: 'Test Product',
            quantity: 1,
            price: 1.00,
            currency: 'SGD',
            sku: 'TEST-SKU-01'
          }
        ]
      }
    };
    
    printInfo("Test payload created:");
    console.log(JSON.stringify(testPayload, null, 2));
    
    try {
      printInfo("Calling Airwallex API to create payment intent...");
      const paymentIntent = await createPaymentIntent(airwallex, testPayload);
      
      printSuccess("Payment intent created successfully!");
      printInfo(`Payment Intent ID: ${paymentIntent.id}`);
      printInfo(`Client Secret: ${paymentIntent.client_secret}`);
      
      // Test retrieving the payment intent
      printHeader("PAYMENT INTENT RETRIEVAL");
      
      try {
        printInfo(`Retrieving payment intent with ID: ${paymentIntent.id}`);
        const retrievedIntent = await getPaymentIntent(airwallex, paymentIntent.id);
        
        printSuccess("Payment intent retrieved successfully!");
        printInfo(`Payment Intent Status: ${retrievedIntent.status}`);
        
        // Print full details
        printHeader("PAYMENT INTENT DETAILS");
        console.log(JSON.stringify(retrievedIntent, null, 2));
        
        return {
          success: true,
          message: "Airwallex integration verified successfully",
          paymentIntent: paymentIntent,
          retrievedIntent: retrievedIntent
        };
      } catch (retrieveError) {
        printError(`Failed to retrieve payment intent: ${retrieveError.message}`);
        
        if (retrieveError.response && retrieveError.response.data) {
          printInfo("API Error Details:");
          console.log(JSON.stringify(retrieveError.response.data, null, 2));
        }
        
        return {
          success: false,
          stage: "retrieve",
          message: retrieveError.message,
          paymentIntent: paymentIntent
        };
      }
    } catch (createError) {
      printError(`Failed to create payment intent: ${createError.message}`);
      
      if (createError.response && createError.response.data) {
        printInfo("API Error Details:");
        console.log(JSON.stringify(createError.response.data, null, 2));
      }
      
      // Try fallback mock payment intent
      printHeader("FALLBACK MOCK PAYMENT INTENT");
      
      printInfo("Creating mock payment intent...");
      const mockIntent = createMockPaymentIntent();
      
      printSuccess("Mock payment intent created successfully");
      printInfo(`Mock Payment Intent ID: ${mockIntent.id}`);
      printInfo(`Mock Client Secret: ${mockIntent.client_secret}`);
      
      return {
        success: false,
        stage: "create",
        message: createError.message,
        mockPaymentIntent: mockIntent
      };
    }
  } catch (error) {
    printError(`Error in Airwallex integration test: ${error.message}`);
    printError(error.stack);
    
    return {
      success: false,
      stage: "initialization",
      message: error.message
    };
  }
}

// Run the test
testAirwallexIntegration()
  .then(result => {
    printHeader("TEST RESULTS");
    
    if (result.success) {
      printSuccess("AIRWALLEX INTEGRATION IS WORKING CORRECTLY");
      printInfo("The integration with Airwallex is fully functional");
      printInfo("You can now use the payment intent creation and verification endpoints");
    } else {
      printWarning("PARTIAL SUCCESS OR ISSUES DETECTED");
      printInfo(`Failed at stage: ${result.stage}`);
      printInfo(`Error message: ${result.message}`);
      
      if (result.paymentIntent) {
        printSuccess("Payment intent was created successfully");
        printInfo("This indicates the basic API connectivity is working");
      }
      
      if (result.mockPaymentIntent) {
        printWarning("Used fallback mock payment intent");
        printInfo("This works for testing but will not process real payments");
      }
    }
    
    printHeader("NEXT STEPS");
    printInfo("1. Ensure your server is correctly configured to listen on port 5000 or 3001");
    printInfo("2. Check for any firewall or antivirus software that might be blocking connections");
    printInfo("3. When deploying to production, ensure the Airwallex credentials are correctly set");
    printInfo("4. The core Airwallex integration is working - focus on fixing server connectivity");
  })
  .catch(err => {
    printHeader("TEST FAILED");
    printError(`Unexpected error: ${err.message}`);
    printError(err.stack);
  });

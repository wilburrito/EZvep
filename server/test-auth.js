const axios = require('axios');

// Make a request to our test endpoint
axios.get('http://localhost:5000/api/test-airwallex-auth')
  .then(response => {
    console.log('Success:');
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.log('Error:');
    console.log(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  });

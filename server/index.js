const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Debug environment variables
console.log('Environment variables:');
console.log('GOOGLE_PLACES_API_KEY exists:', process.env.GOOGLE_PLACES_API_KEY ? 'Yes' : 'No');
console.log('GOOGLE_PLACE_ID:', process.env.GOOGLE_PLACE_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ message: 'Server is working correctly!', timestamp: new Date().toISOString() });
});

// Manual reviews endpoint - reads from local JSON file
app.get('/api/manual-reviews', (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Read reviews from JSON file
    const fs = require('fs');
    const path = require('path');
    const reviewsPath = path.join(__dirname, 'data', 'reviews.json');
    
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews file not found' });
    }
    
    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
    
    // Process dates to ensure they're in the right format
    if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
      reviewsData.reviews = reviewsData.reviews.map(review => {
        // Convert ISO date string to timestamp if needed
        if (typeof review.time === 'string') {
          review.time = new Date(review.time).getTime();
        }
        return review;
      });
    }
    
    console.log(`Serving ${reviewsData.reviews?.length || 0} manual reviews`);
    return res.json(reviewsData);
  } catch (error) {
    console.error('Error reading manual reviews:', error);
    return res.status(500).json({ error: 'Failed to read manual reviews', message: error.message });
  }
});

// Google Reviews API endpoint
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Google Places API endpoint
app.get('/api/google-reviews', async (req, res) => {
  try {
    // Enable CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Get the Place ID from request query or use default
    const placeId = req.query.placeId || process.env.GOOGLE_PLACE_ID || 'ChIJ88pp-7EZtE0RttmdZtbpdMc'; // Using same Place ID as frontend
    console.log('Using Place ID:', placeId);
    
    // Google Places API key (store this in .env file)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    // Use mock data if no API key is provided (for development)
    if (!apiKey) {
      console.log('No API key found - using mock data');
      // Return mock data
      const mockData = {
        name: "EZVEP",
        averageRating: 4.8,
        totalReviews: 5,
        reviews: [
          {
            author_name: "Sarah L.",
            rating: 5,
            text: "Fantastic service! Made the VEP application process so easy. Highly recommend!",
            time: Date.now() - 2 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Sarah+L&background=random"
          },
          {
            author_name: "Michael T.",
            rating: 4,
            text: "Good experience. Fast turnaround and helpful customer service.",
            time: Date.now() - 10 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Michael+T&background=random"
          },
          {
            author_name: "David K.",
            rating: 5,
            text: "Very professional service. They handled everything for me and the RFID tag was delivered quickly. Will use again next time!",
            time: Date.now() - 15 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=David+K&background=random"
          },
          {
            author_name: "Linda P.",
            rating: 5,
            text: "Excellent service! They made the whole process very smooth and stress-free.",
            time: Date.now() - 30 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Linda+P&background=random"
          },
          {
            author_name: "Jason R.",
            rating: 4,
            text: "Great service, very responsive to queries. Would recommend.",
            time: Date.now() - 45 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Jason+R&background=random"
          }
        ]
      };
      return res.json(mockData);
    }
    
    console.log('Making request to Google Places API...');
    // Construct Google Places Details API URL - request more fields
    const placesResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        key: apiKey,
        // Explicitly request profile_photo_url in the fields parameter
        fields: 'reviews(author_name,rating,text,time,profile_photo_url),rating,user_ratings_total',
        reviews_no_translations: true,
        reviews_sort: 'newest',
        // Request maximum number of reviews
        reviews_limit: 20
      }
    });
    
    // Log raw response for debugging
    console.log('Raw API response:', JSON.stringify(placesResponse.data, null, 2).substring(0, 1000) + '...');
    
    console.log('Google Places API Response Status:', placesResponse.status);
    
    // Check for API errors
    if (placesResponse.data.status !== 'OK') {
      console.error('Google Places API error:', placesResponse.data.status, placesResponse.data.error_message);
      return res.status(400).json({ error: 'Google Places API error', message: placesResponse.data.error_message || placesResponse.data.status });
    }

    // Extract reviews data
    const { result } = placesResponse.data;
    
    if (!result) {
      console.error('No result found in API response');
      return res.status(404).json({ error: 'No reviews found for this place ID' });
    }
    
    console.log('Result contains reviews?', !!result.reviews);
    if (result.reviews) {
      console.log('Number of reviews:', result.reviews.length);
    }
    
    // Log all available fields from the result
    console.log('Available fields in result:', Object.keys(result));
    
    // Log the first review to understand the structure
    if (result.reviews && result.reviews.length > 0) {
      console.log('First review sample structure:', JSON.stringify(result.reviews[0], null, 2));
    }
    
    // Check if we have reviews
    if (!result.reviews || result.reviews.length === 0) {
      console.log('No reviews found in the API response. Using mock data instead.');
      
      // Use mock data when no reviews are available from API
      const mockData = {
        name: result.name || "EZVEP",
        averageRating: result.rating || 4.8,
        totalReviews: result.user_ratings_total || 5,
        reviews: [
          {
            author_name: "Sarah L.",
            rating: 5,
            text: "Fantastic service! Made the VEP application process so easy. Highly recommend!",
            time: Date.now() - 2 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Sarah+L&background=random"
          },
          {
            author_name: "Michael T.",
            rating: 4,
            text: "Good experience. Fast turnaround and helpful customer service.",
            time: Date.now() - 10 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Michael+T&background=random"
          },
          {
            author_name: "David K.",
            rating: 5,
            text: "Very professional service. They handled everything for me and the RFID tag was delivered quickly. Will use again next time!",
            time: Date.now() - 15 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=David+K&background=random"
          },
          {
            author_name: "Linda P.",
            rating: 5,
            text: "Excellent service! They made the whole process very smooth and stress-free.",
            time: Date.now() - 30 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Linda+P&background=random"
          },
          {
            author_name: "Jason R.",
            rating: 4,
            text: "Great service, very responsive to queries. Would recommend.",
            time: Date.now() - 45 * 86400000,
            profile_photo_url: "https://ui-avatars.com/api/?name=Jason+R&background=random"
          }
        ]
      };
      
      return res.json(mockData);
    } else {
      // Format and send the real reviews
      // Process reviews to add image URLs where available
      const processedReviews = result.reviews.map(review => {
        // Check if review has photos
        if (review.photos && review.photos.length > 0) {
          return {
            ...review,
            review_image_url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${review.photos[0].photo_reference}&key=${apiKey}`
          };
        }
        return review;
      });
      
      const formattedResponse = {
        name: result.name || 'Business',
        averageRating: result.rating || 0,
        totalReviews: result.user_ratings_total || (result.reviews ? result.reviews.length : 0),
        reviews: processedReviews || []
      };
      
      console.log(`Returning ${formattedResponse.reviews.length} real reviews`);
      return res.json(formattedResponse);
    }
    
  } catch (error) {
    console.error('Error fetching Google reviews:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    return res.status(500).json({ 
      error: 'Failed to fetch Google reviews',
      message: error.message 
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('/', (req, res) => {
    res.send('API is running');
  });

  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.json({ message: 'Server is working correctly!', timestamp: new Date().toISOString() });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

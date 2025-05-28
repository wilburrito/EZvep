const axios = require('axios');

// Google Reviews API endpoint - Vercel serverless function
module.exports = async (req, res) => {
  // Set CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Log debugging info for API call
  console.log('📢 API call received for Google Reviews');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the Place ID from request query or use default
    const placeId = req.query.placeId || process.env.GOOGLE_PLACE_ID || 'ChIJ88pp-7EZtE0RttmdZtbpdMc';
    console.log(`🔍 Using Place ID: ${placeId}`);
    
    // Google Places API key (stored in Vercel environment variables)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log(`🔑 API Key available: ${apiKey ? 'Yes' : 'No'}`);
    
    // Use mock data if no API key is provided
    if (!apiKey) {
      console.log('⚠️ No API key found, returning mock data');
      // Return mock data with proper formatting for UI
      return res.status(200).json({
        name: "EZVEP",
        averageRating: 4.8,
        totalReviews: 5,
        reviews: [
          {
            author_name: "Nikki Lee",
            rating: 5,
            text: "Initially a bit slow to reply my message but once you sent your details it's quick process. I work overseas and my wife working with kids, thanks to EZ*EP for make it easier for us.",
            time: Math.floor(Date.now() / 1000) - 2 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Nikki+Lee&background=E3F2FD&color=0057b8&size=50"
          },
          {
            author_name: "Chethan S",
            rating: 5,
            text: "Excellent service from start to finish. The team handled everything smoothly and got the job done within a week. They were quick to respond and resolve it without any hassle. Truly dependable and professional — would definitely recommend EZVEP SG!",
            time: Math.floor(Date.now() / 1000) - 10 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Chethan+S&background=E3F2FD&color=0057b8&size=50"
          },
          {
            author_name: "Anand VijayaKumar",
            rating: 5,
            text: "The experience getting the Vep tag was smooth. They helped every step of the way and I wish I contacted them sooner as I'd been trying by myself for many many months before unsuccessfully. Thanks guys.",
            time: Math.floor(Date.now() / 1000) - 15 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Anand+V&background=E3F2FD&color=0057b8&size=50"
          }
        ]
      });
    }

    // Make request to Google Places API
    console.log('🌐 Making request to Google Places API...');
    
    // First make a request to get all available reviews
    const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: apiKey,
        // Explicitly request fields needed for the enhanced UI
        fields: 'reviews(author_name,rating,text,time,profile_photo_url),rating,user_ratings_total,name',
        reviews_no_translations: true,
        reviews_sort: 'newest',
        reviews_no_translation_sorting: true,  // This helps get more reviews
        language: 'en'  // Force English reviews for consistency
      }
    });
    
    // If we didn't get enough reviews, try another request with different parameters
    let additionalReviews = [];
    if (placesResponse.data.status === 'OK' && 
        placesResponse.data.result && 
        placesResponse.data.result.reviews && 
        placesResponse.data.result.reviews.length < 10) {
        
      try {
        console.log('🔍 Attempting to fetch additional reviews...');
        const additionalResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id: placeId,
            key: apiKey,
            fields: 'reviews',
            reviews_sort: 'relevance',  // Try a different sort order
            reviews_no_translations: true
          }
        });
        
        if (additionalResponse.data.status === 'OK' && 
            additionalResponse.data.result && 
            additionalResponse.data.result.reviews) {
          additionalReviews = additionalResponse.data.result.reviews;
          console.log(`✅ Found ${additionalReviews.length} additional reviews`);
        }
      } catch (err) {
        console.log('⚠️ Error fetching additional reviews:', err.message);
      }
    }
    
    console.log(`📊 Google API response status: ${placesResponse.data.status}`);

    // Check for valid response
    if (placesResponse.data.status !== 'OK' || !placesResponse.data.result) {
      console.log(`❌ Invalid Google API response: ${placesResponse.data.status}`);
      console.log(`❌ Error message: ${placesResponse.data.error_message || 'No error message provided'}`);
      return res.status(200).json({
        name: "EZVEP",
        averageRating: 4.8,
        totalReviews: 5,
        reviews: [
          {
            author_name: "Nikki Lee",
            rating: 5,
            text: "Initially a bit slow to reply my message but once you sent your details it's quick process. I work overseas and my wife working with kids, thanks to EZ*EP for make it easier for us.",
            time: Math.floor(Date.now() / 1000) - 2 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Nikki+Lee&background=E3F2FD&color=0057b8&size=50"
          },
          {
            author_name: "Chethan S",
            rating: 5,
            text: "Excellent service from start to finish. The team handled everything smoothly and got the job done within a week. They were quick to respond and resolve it without any hassle. Truly dependable and professional — would definitely recommend EZVEP SG!",
            time: Math.floor(Date.now() / 1000) - 10 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Chethan+S&background=E3F2FD&color=0057b8&size=50"
          }
        ]
      });
    }

    const { result } = placesResponse.data;
    
    // Check if we have reviews
    if (!result.reviews || result.reviews.length === 0) {
      console.log('⚠️ No reviews found in Google API response');
      return res.status(200).json({
        name: result.name || "EZVEP",
        averageRating: result.rating || 4.8,
        totalReviews: result.user_ratings_total || 5,
        reviews: [
          {
            author_name: "Nikki Lee",
            rating: 5,
            text: "Initially a bit slow to reply my message but once you sent your details it's quick process. I work overseas and my wife working with kids, thanks to EZ*EP for make it easier for us.",
            time: Math.floor(Date.now() / 1000) - 2 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Nikki+Lee&background=E3F2FD&color=0057b8&size=50"
          },
          {
            author_name: "Chethan S",
            rating: 5,
            text: "Excellent service from start to finish. The team handled everything smoothly and got the job done within a week. They were quick to respond and resolve it without any hassle. Truly dependable and professional — would definitely recommend EZVEP SG!",
            time: Math.floor(Date.now() / 1000) - 10 * 86400,
            profile_photo_url: "https://ui-avatars.com/api/?name=Chethan+S&background=E3F2FD&color=0057b8&size=50"
          }
        ]
      });
    } else {
      // Process and format reviews for the enhanced UI
      console.log(`✅ Found ${result.reviews.length} reviews in Google API response`);
      
      // Combine the main reviews with any additional reviews we found
      let allReviews = [...result.reviews];
      
      // Add additional reviews if we found any
      if (additionalReviews && additionalReviews.length > 0) {
        // Combine reviews but avoid duplicates by checking author names
        const seenAuthors = new Set(allReviews.map(r => r.author_name));
        
        additionalReviews.forEach(review => {
          if (!seenAuthors.has(review.author_name)) {
            allReviews.push(review);
            seenAuthors.add(review.author_name);
          }
        });
        
        console.log(`📃 Total unique reviews after merging: ${allReviews.length}`);
      }
      
      // Process all reviews for enhanced UI
      const processedReviews = allReviews.map(review => {
        if (review.photos && review.photos.length > 0) {
          return {
            ...review,
            review_image_url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${review.photos[0].photo_reference}&key=${apiKey}`
          };
        }
        return review;
      });
      
      // Sort reviews by time (newest first)
      processedReviews.sort((a, b) => b.time - a.time);
      
      return res.status(200).json({
        name: result.name || 'EZVEP',
        averageRating: result.rating || 0,
        totalReviews: result.user_ratings_total || processedReviews.length,
        reviews: processedReviews
      });
    }
    
  } catch (error) {
    // Error handling with fallback data
    console.log('❌ Exception in API call:');
    console.error(error);
    console.log('Returning fallback data instead');
    return res.status(200).json({
      name: "EZVEP",
      averageRating: 4.8,
      totalReviews: 5,
      reviews: [
        {
          author_name: "Nikki Lee",
          rating: 5,
          text: "Initially a bit slow to reply my message but once you sent your details it's quick process. I work overseas and my wife working with kids, thanks to EZ*EP for make it easier for us.",
          time: Math.floor(Date.now() / 1000) - 2 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=Nikki+Lee&background=E3F2FD&color=0057b8&size=50"
        },
        {
          author_name: "Chethan S",
          rating: 5,
          text: "Excellent service from start to finish. The team handled everything smoothly and got the job done within a week. They were quick to respond and resolve it without any hassle. Truly dependable and professional — would definitely recommend EZVEP SG!",
          time: Math.floor(Date.now() / 1000) - 10 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=Chethan+S&background=E3F2FD&color=0057b8&size=50"
        }
      ]
    });
  }
};

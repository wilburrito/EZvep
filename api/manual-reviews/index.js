// Manual reviews API endpoint as serverless function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Return a set of curated manual reviews
    return res.status(200).json({
      name: "EZVEP",
      averageRating: 4.9,
      totalReviews: 5,
      reviews: [
        {
          author_name: "Nikki Lee",
          rating: 5,
          text: "Initially a bit slow to reply my message but once you sent your details it's quick process. I work overseas and my wife working with kids, thanks to EZ*EP for make it easier for us.",
          time: Math.floor(Date.now() / 1000) - 2 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=Nikki+Lee&background=E3F2FD&color=0057b8"
        },
        {
          author_name: "Chethan S",
          rating: 5,
          text: "Excellent service from start to finish. The team handled everything smoothly and got the job done within a week. They were quick to respond and resolve it without any hassle. Truly dependable and professional — would definitely recommend EZVEP SG!",
          time: Math.floor(Date.now() / 1000) - 10 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=Chethan+S&background=E3F2FD&color=0057b8"
        },
        {
          author_name: "Anand VijayaKumar",
          rating: 5,
          text: "The experience getting the Vep tag was smooth. They helped every step of the way and I wish I contacted them sooner as I'd been trying by myself for many many months before unsuccessfully. Thanks guys.",
          time: Math.floor(Date.now() / 1000) - 15 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=Anand+V&background=E3F2FD&color=0057b8"
        },
        {
          author_name: "David Eshkol",
          rating: 5,
          text: "Very professional service. They handled everything for me and the RFID tag was delivered quickly. Will use again next time!",
          time: Math.floor(Date.now() / 1000) - 30 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=David+E&background=E3F2FD&color=0057b8"
        },
        {
          author_name: "Linda Prakash",
          rating: 5,
          text: "Excellent service! They made the whole process very smooth and stress-free.",
          time: Math.floor(Date.now() / 1000) - 45 * 86400,
          profile_photo_url: "https://ui-avatars.com/api/?name=Linda+P&background=E3F2FD&color=0057b8"
        }
      ]
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'An error occurred', 
      message: error.message 
    });
  }
};

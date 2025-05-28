import { useState, useEffect, useRef } from "react";
import { Row, Col, Rate, Spin, Button, Carousel } from "antd";
import { withTranslation } from "react-i18next";
import { GoogleReviewsProps } from "./types";
import './styles.css';
import {
  GoogleReviewsContainer,
  ReviewsWrapper,
  ReviewCard,
  ReviewAuthor,
  ReviewText,
  ReviewDate,
  ReviewImageContainer,
  ReviewsTitle,
  ReviewsCount
} from "./styles";

// Define review interface to handle all possible properties from Google Places API
interface GoogleReview {
  author_name: string;
  rating: number;
  text?: string;
  text_original?: string; // Some reviews have text under text_original instead of text
  time: number;
  profile_photo_url?: string;
  review_image_url?: string; // Optional image attached to the review
  photos?: Array<{ photo_reference: string }>; // Raw photo references from Google API
  author_url?: string;
  language?: string;
  relative_time_description?: string;
}

// Main Google Reviews component

const GoogleReviews = ({ title, content, id, t }: GoogleReviewsProps) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<any>(null);

  // Handle carousel navigation
  const nextSlide = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const prevSlide = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      console.log('🔄 Starting to fetch reviews...');
      
      try {
        // Call our backend API to fetch Google reviews
        const placeId = process.env.REACT_APP_GOOGLE_PLACE_ID || "ChIJ88pp-7EZtE0RttmdZtbpdMc";
        console.log('🏬 Using Place ID:', placeId);
        
        // Use Google Places API to fetch real reviews
        const useManualReviews = false;
        
        // Determine the API URL - optimized for Vercel deployment
        const apiBaseUrl = useManualReviews
          ? '/api/manual-reviews'
          : '/api/google-reviews';
        
        console.log('🌐 Using API URL:', apiBaseUrl);
        
        try {
          // Make the API call to our backend with CORS headers
          console.log(`🚀 Attempting to fetch reviews from: ${apiBaseUrl}?placeId=${placeId}`);
          const response = await fetch(`${apiBaseUrl}?placeId=${placeId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`API response error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data.reviews && data.reviews.length > 0) {
            console.log(`✅ Successfully loaded ${data.reviews.length} reviews from API`);
            
            // Deduplicate reviews by author name
            const uniqueReviews = [];
            const authorsSeen = new Set();
            
            data.reviews.forEach(review => {
              if (!authorsSeen.has(review.author_name)) {
                authorsSeen.add(review.author_name);
                uniqueReviews.push(review);
              }
            });
            
            setReviews(uniqueReviews);
          } else {
            console.log('⚠️ No reviews found in API response');
            setReviews([]);
          }
        } catch (error) {
          console.error('⛔ Error fetching reviews from API:', error);
          // Use fallback data if API fails
          setReviews([
            {
              author_name: "Simon Lee",
              rating: 5,
              text: "Excellent Services provided by First VEP Solutions. Fast and very good services. Friendly and very helpful. Strongly recommend their services for VEP Malaysia!",
              time: 1620000000000,
              profile_photo_url: "https://ui-avatars.com/api/?name=Simon+Lee&background=random"
            },
            {
              author_name: "Amos Lum",
              rating: 5,
              text: "Excellent service. Very fast and delivered as promised.",
              time: 1630000000000,
              profile_photo_url: "https://ui-avatars.com/api/?name=Amos+Lum&background=random"
            },
            {
              author_name: "Muhammad Syairul",
              rating: 5,
              text: "The service provided was quick and efficient! Everything was done within a week. Highly recommend to anyone who's applying for it 😊",
              time: 1640000000000,
              profile_photo_url: "https://ui-avatars.com/api/?name=Muhammad+Syairul&background=random"
            }
          ]);
        }
      } catch (error) {
        console.error('⛔ Error in review fetching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <GoogleReviewsContainer id="reviews">
      <Row justify="center" gutter={[0, 30]}>
        <Col xs={24} md={23} lg={22} xl={20}>
          <ReviewsTitle>Our Reviews</ReviewsTitle>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Rate disabled defaultValue={5} style={{ fontSize: '28px', color: '#FFC107' }} />
          </div>
          <ReviewsCount>Over 50+ Positive Reviews</ReviewsCount>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img 
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
              alt="Google" 
              height="35" 
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <ReviewsWrapper>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <Button
                  type="primary"
                  shape="circle"
                  onClick={prevSlide}
                  style={{ 
                    marginRight: '10px',
                    fontSize: '16px',
                    width: '38px',
                    height: '38px'
                  }}
                >
                  ←
                </Button>
                <Button
                  type="primary"
                  shape="circle"
                  onClick={nextSlide}
                  style={{ 
                    fontSize: '16px',
                    width: '38px',
                    height: '38px'
                  }}
                >
                  →
                </Button>
              </div>

              <div className="carousel-container">
                <Carousel 
                  ref={carouselRef}
                  dots={{ className: 'dots' }}
                  slidesToShow={3}
                  autoplay={false}
                  infinite={true}
                  cssEase={'ease-out'}
                  slidesPerRow={1}
                  centerPadding="0px"
                  className="full-width-carousel"
                  responsive={[
                    {
                      breakpoint: 1400,
                      settings: {
                        slidesToShow: 2,
                      },
                    },
                    {
                      breakpoint: 992,
                      settings: {
                        slidesToShow: 1,
                      },
                    },
                  ]}
                >
                  {/* Sort reviews by newest first (highest timestamp) */}
                  {[...reviews].sort((a, b) => b.time - a.time).map((review, index) => (
                    <div key={index} style={{ padding: '0 10px' }}>
                      <ReviewCard>
                        <ReviewAuthor>
                          {review.profile_photo_url ? (
                            <img 
                              src={review.profile_photo_url} 
                              alt={review.author_name}
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid #eaeaea'
                              }}
                              onError={(e) => {
                                // On error, replace with initials but don't disrupt the layout
                                const target = e.currentTarget;
                                // Replace just the img with the initials div, not the whole parent
                                const initialsDiv = document.createElement('div');
                                initialsDiv.style.width = '50px';
                                initialsDiv.style.height = '50px';
                                initialsDiv.style.borderRadius = '50%';
                                initialsDiv.style.display = 'flex';
                                initialsDiv.style.alignItems = 'center';
                                initialsDiv.style.justifyContent = 'center';
                                initialsDiv.style.backgroundColor = '#E3F2FD';
                                initialsDiv.style.color = '#0057b8';
                                initialsDiv.style.fontWeight = 'bold';
                                initialsDiv.style.fontSize = '18px';
                                initialsDiv.textContent = review.author_name.substring(0, 2).toUpperCase();
                                
                                if (target.parentElement) {
                                  target.parentElement.replaceChild(initialsDiv, target);
                                }
                              }}
                            />
                          ) : (
                            <div style={{ 
                              width: '50px', 
                              height: '50px', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              backgroundColor: '#E3F2FD',
                              color: '#0057b8',
                              fontWeight: 'bold',
                              fontSize: '18px'
                            }}>
                              {review.author_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4>{review.author_name || 'Anonymous'}</h4>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {Array(review.rating || 5).fill(0).map((_, i) => (
                                <span key={i} style={{ color: '#FDCC0D', marginRight: '3px', fontSize: '16px' }}>★</span>
                              ))}
                            </div>
                          </div>
                        </ReviewAuthor>
                        
                        <ReviewText>
                          {review.text || (review.text_original ? review.text_original : 'Great service!')}
                        </ReviewText>
                        
                        {/* Display review image if available */}
                        {review.review_image_url && review.review_image_url.length > 0 && (
                          <ReviewImageContainer>
                            <img src={review.review_image_url} alt="" />
                          </ReviewImageContainer>
                        )}
                        
                        <div style={{ marginTop: 'auto' }}>
                          <ReviewDate>
                            {new Date(review.time * 1000).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </ReviewDate>
                        </div>
                      </ReviewCard>
                    </div>
                  ))}
                </Carousel>
              </div>
            </ReviewsWrapper>
          )}
        </Col>
      </Row>
    </GoogleReviewsContainer>
  );
};

export default withTranslation()(GoogleReviews);

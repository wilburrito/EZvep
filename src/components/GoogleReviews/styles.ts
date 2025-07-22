import styled from "styled-components";

// Define section props interface locally to avoid dependency issues
interface SectionProps {
  id?: string;
  border?: boolean;
}

export const ReviewsTitle = styled.h1`
  color: #18216d;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

export const ReviewsCount = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 500;
`;

export const ReviewActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 5px;
`;

export const GoogleReviewsContainer = styled.section<SectionProps>`
  position: relative;
  padding: 4rem 0;
  background: #ffffff;
  
  @media only screen and (max-width: 768px) {
    padding: 3rem 0;
  }
`;

export const ReviewsWrapper = styled.div`
  padding: 1rem 0;
  position: relative;
  
  .carousel-container {
    position: relative;
    padding: 0 0 20px 0;
    margin: 0 auto;
    max-width: 100%;
    width: 100%;
    overflow: visible;
  }
  
  .ant-carousel .slick-dots li button {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    background-color: #eaeaea;
    
    &:hover, &:focus {
      background-color: #1890ff;
    }
  }
  
  .full-width-carousel {
    width: 100%;
  }
  
  .full-width-carousel .slick-track {
    margin: 0;
  }
  
  .full-width-carousel .slick-slide > div {
    padding: 0;
  }
  
  .slick-list {
    margin: 0;
  }
  
  .nav-button {
    opacity: 0.7;
    transition: all 0.3s ease;
    
    &:hover {
      opacity: 1;
      transform: translateY(-50%) scale(1.1);
    }
  }
`;

export const ReviewCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
  padding: 20px 15px 20px 15px;
  margin: 0 5px 10px 5px;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  text-align: left;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f0f0f0;
  width: calc(100% - 10px);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

export const ReviewAuthor = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  
  h4 {
    margin: 0 0 3px 0;
    font-weight: 600;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  
  div {
    margin-left: 12px;
  }
`;

export const ReviewText = styled.div`
  margin: 0 0 1rem 0;
  color: #333333;
  flex-grow: 1;
  line-height: 1.5;
  font-size: 0.92rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  overflow-wrap: break-word;
  
  p {
    margin: 0 0 10px 0;
    text-align: left;
  }
`;

export const ReviewDate = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #777777;
  margin-top: auto;
  padding-top: 0.5rem;
`;

export const ReviewImageContainer = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 180px;
    object-fit: cover;
    border-radius: 10px;
    display: block;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
`;

export const OverallRating = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

export const RatingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

export const RatingValue = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222;
  display: inline-block;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`;

export const RatingCount = styled.div`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

export const GoogleLogo = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
  
  img {
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

export const WriteReviewButton = styled.a`
  display: inline-block;
  background: #0057b8;
  color: #ffffff;
  font-weight: 500;
  padding: 0.7rem 1.8rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
  margin-top: 1.5rem;
  
  &:hover {
    background: #004494;
    color: #ffffff;
    text-decoration: none;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

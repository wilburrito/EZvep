import { SvgIconProps } from "../types";

export const SvgIcon = ({ src, width, height }: SvgIconProps) => {
  // For Create React App, we need to use process.env.PUBLIC_URL to access assets
  let imgPath;
  try {
    // First try to require the image directly (works in development)
    imgPath = require(`../../../public/img/svg/${src}`);
  } catch (e) {
    // Fallback paths for production
    imgPath = `${process.env.PUBLIC_URL}/img/svg/${src}`;
  }
  
  return (
    <img 
      src={imgPath} 
      alt={src} 
      width={width} 
      height={height} 
      onError={(e) => {
        // Fallback to other possible paths if the primary one fails
        const target = e.currentTarget;
        target.onerror = null; // Prevent infinite loop
        
        // Try different paths
        const fallbackPaths = [
          `${process.env.PUBLIC_URL}/${src}`,
          `/img/svg/${src}`,
          `/${src}`
        ];
        
        // Create a simple image loader to try different paths
        const tryLoadingImage = (pathIndex = 0) => {
          if (pathIndex >= fallbackPaths.length) return; // No more paths to try
          
          target.src = fallbackPaths[pathIndex];
          // If this path also fails, try the next one
          target.onerror = () => tryLoadingImage(pathIndex + 1);
        };
        
        tryLoadingImage();
      }}
    />
  );
};

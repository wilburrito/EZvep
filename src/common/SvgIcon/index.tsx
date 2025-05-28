import { SvgIconProps } from "../types";

export const SvgIcon = ({ src, width, height }: SvgIconProps) => {
  // Get the correct image path for both development and production environments
  const imgPath = process.env.NODE_ENV === 'production' 
    ? `/img/svg/${src}` 
    : `/img/svg/${src}`;
  
  return (
    <img 
      src={imgPath} 
      alt={src} 
      width={width} 
      height={height} 
      onError={(e) => {
        // Fallback to direct path if normal path fails
        const target = e.currentTarget;
        target.onerror = null; // Prevent infinite loop
        target.src = `/${src}`;
      }}
    />
  );
};

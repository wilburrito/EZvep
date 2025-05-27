// Add TypeScript declarations for libraries we're using
declare module 'react-awesome-reveal';
declare module 'i18next-xhr-backend';
declare module 'i18next-browser-languagedetector';

// Add missing Window interface extensions
interface Window {
  gtag: (
    command: string,
    action: string,
    params?: {
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}

import { useContext } from 'react';
import { GoogleReCaptchaContext } from './context';
import { GoogleReCaptchaContextProps } from './types';

/**
 * Hook to access reCAPTCHA functionality
 * @returns The reCAPTCHA context value
 */
export const useGoogleReCaptcha = (): GoogleReCaptchaContextProps => {
  const context = useContext(GoogleReCaptchaContext);
  
  if (!context) {
    throw new Error(
      'useGoogleReCaptcha must be used within a GoogleReCaptchaProvider'
    );
  }
  
  return context;
};
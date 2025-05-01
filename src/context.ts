import { createContext } from 'react';
import { GoogleReCaptchaContextProps } from './types';

// Create the default context value
const defaultContext: GoogleReCaptchaContextProps = {
  executeRecaptcha: undefined,
  container: undefined,
  scriptLoaded: false,
  scriptError: null
};

// Create and export the context
export const GoogleReCaptchaContext = createContext<GoogleReCaptchaContextProps>(defaultContext);
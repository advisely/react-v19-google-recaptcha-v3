import { createContext } from 'react';
import { GoogleReCaptchaContextProps } from './types';

// GoogleReCaptchaContext provides the reCAPTCHA context or undefined if not within a provider
export const GoogleReCaptchaContext = createContext<GoogleReCaptchaContextProps | undefined>(undefined);
export interface GoogleReCaptchaProviderProps {
  /**
   * Google reCAPTCHA site key
   */
  reCaptchaKey: string;

  /**
   * Language code for reCAPTCHA
   * @default 'en'
   */
  language?: string;

  /**
   * Script loading properties
   */
  scriptProps?: {
    /**
     * Set the script loading strategy
     * @default true
     */
    async?: boolean;

    /**
     * Defer script loading
     * @default true
     */
    defer?: boolean;

    /**
     * Where to append the script
     * @default 'head'
     */
    appendTo?: 'head' | 'body';

    /**
     * Nonce for CSP
     */
    nonce?: string;

    /**
     * ID for the script tag
     * @default 'google-recaptcha-v3'
     */
    id?: string;
  };

  /**
   * Optional container element to render inside the provider
   */
  container?: React.ReactNode | ((executeRecaptcha: ExecuteRecaptcha) => React.ReactNode);

  /**
   * Render props for custom integration
   */
  children?: React.ReactNode | ((executeRecaptcha: ExecuteRecaptcha) => React.ReactNode);

  /**
   * Callback when reCAPTCHA is loaded and ready
   */
  onLoad?: () => void;

  /**
   * Callback when reCAPTCHA fails to load
   */
  onError?: (error: Error) => void;

  /**
   * Value to indicate if the script should be injected
   * @default true
   */
  inject?: boolean;

  /**
   * Enterprise version of reCAPTCHA
   * @default false
   */
  useEnterprise?: boolean;

  /**
   * Refresh reCAPTCHA when this value changes
   */
  refreshReCaptcha?: boolean | number;
}

export interface GoogleReCaptchaContextProps {
  executeRecaptcha?: ExecuteRecaptcha;
  container?: HTMLDivElement;
  scriptLoaded: boolean;
  scriptError: Error | null;
}

export type ExecuteRecaptcha = (action: string) => Promise<string>;

// Global types for the reCAPTCHA script
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      enterprise?: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

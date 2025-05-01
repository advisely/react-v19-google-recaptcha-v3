import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleReCaptchaContext } from './context';
import { GoogleReCaptchaProviderProps, ExecuteRecaptcha } from './types';

// Define default script props outside the component for stable reference
// Explicitly type it using NonNullable to access the nested type easily
const defaultScriptProps: NonNullable<GoogleReCaptchaProviderProps['scriptProps']> = {
  async: true,
  defer: true,
  appendTo: 'head' as 'head' | 'body',
  id: 'google-recaptcha-v3',
  nonce: undefined // Add missing optional property
};

/**
 * Google ReCaptcha V3 Provider Component
 */
export const GoogleReCaptchaProvider: React.FC<GoogleReCaptchaProviderProps> = ({
  reCaptchaKey,
  language = 'en',
  useEnterprise = false,
  scriptProps = defaultScriptProps, // Use the stable default object
  container,
  children,
  onLoad,
  onError,
  inject = true,
  refreshReCaptcha = false
}) => {
  // Ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // State for tracking script loading status
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<Error | null>(null);

  // Previous refreshRecaptcha value for comparison
  const previousRefreshReCaptchaRef = useRef<boolean | number>(refreshReCaptcha);

  // Generate the script URL based on enterprise flag and language
  const scriptSrc = useMemo(() => {
    const baseUrl = useEnterprise
      ? 'https://www.google.com/recaptcha/enterprise.js'
      : 'https://www.google.com/recaptcha/api.js';

    return `${baseUrl}?render=${reCaptchaKey}&hl=${language}`;
  }, [reCaptchaKey, language, useEnterprise]);

  // Load the reCAPTCHA script
  useEffect(() => {
    console.log('useEffect running, inject:', inject);
    if (!inject) {
      console.log('Early return: inject is false');
      return;
    }

    const existingScript = document.getElementById(scriptProps.id ?? 'google-recaptcha-v3');
    console.log('existingScript check:', existingScript);
    if (existingScript) {
      console.log('Script already exists, considering it loaded');
      setScriptLoaded(true);
      return;
    }

    console.log('Creating new script element');
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = scriptProps.async ?? false;
    script.defer = scriptProps.defer ?? false;
    if (scriptProps.nonce) script.nonce = scriptProps.nonce;
    script.id = scriptProps.id ?? 'google-recaptcha-v3';

    // Handle script load event
    const handleLoad = () => {
      setScriptLoaded(true);
      if (onLoad) {
        onLoad();
      }
    };

    // Handle script error event
    const handleError = (error: Event | string) => {
      const errorMsg = error instanceof Error
        ? error
        : new Error('ReCaptcha script failed to load');

      setScriptError(errorMsg);

      if (onError) {
        onError(errorMsg);
      }
    };

    script.onload = handleLoad;
    script.onerror = handleError;

    const appendTo = scriptProps.appendTo === 'body' ? document.body : document.head;
    console.log('Appending script to:', appendTo === document.body ? 'body' : 'head');
    appendTo.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (appendTo.contains(script)) {
        appendTo.removeChild(script);
      }
      setScriptLoaded(false);
    };
  }, [inject, scriptSrc, scriptProps, onLoad, onError]);

  // Handle refreshReCaptcha changes
  useEffect(() => {
    if (
      scriptLoaded &&
      refreshReCaptcha !== previousRefreshReCaptchaRef.current &&
      window.grecaptcha
    ) {
      // Reset reCAPTCHA on refresh signal change
      const grecaptcha = useEnterprise ? window.grecaptcha?.enterprise : window.grecaptcha;

      grecaptcha?.ready(() => {
        // Reset internal state if needed
        // This doesn't reset the actual reCAPTCHA state,
        // but prepares for a new token to be generated
      });

      previousRefreshReCaptchaRef.current = refreshReCaptcha;
    }
  }, [refreshReCaptcha, scriptLoaded, useEnterprise]);

  // Define the executeRecaptcha function
  const executeRecaptcha: ExecuteRecaptcha = useCallback(
    async (action) => {
      if (!scriptLoaded) {
        throw new Error('ReCaptcha script not loaded yet');
      }

      if (!window.grecaptcha) {
        throw new Error('grecaptcha not available');
      }

      return new Promise<string>((resolve, reject) => {
        try {
          const grecaptcha = useEnterprise ? window.grecaptcha?.enterprise : window.grecaptcha;

          if (!grecaptcha) {
            throw new Error(useEnterprise
              ? 'grecaptcha.enterprise not available'
              : 'grecaptcha not available'
            );
          }

          grecaptcha.ready(async () => {
            try {
              const token = await grecaptcha.execute(reCaptchaKey, { action });
              resolve(token);
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    [reCaptchaKey, scriptLoaded, useEnterprise]
  );

  // Create the context value
  const contextValue = useMemo(
    () => ({
      executeRecaptcha: scriptLoaded ? executeRecaptcha : undefined,
      container: containerRef.current || undefined,
      scriptLoaded,
      scriptError
    }),
    [executeRecaptcha, scriptLoaded, scriptError]
  );

  // Render the component
  let containerContent: React.ReactNode = null;
  if (typeof container === 'function') {
    if (scriptLoaded) {
      const result = container(executeRecaptcha) as React.ReactNode;
      containerContent = result;
    }
  } else if (container) { 
    containerContent = container;
  }

  // Prepare children content
  let childrenContent: React.ReactNode = null;
  if (typeof children === 'function') {
    if (scriptLoaded) {
      childrenContent = children(executeRecaptcha);
    }
  } else if (children) {
    childrenContent = children;
  }

  return (
    <GoogleReCaptchaContext.Provider value={contextValue}>
      {/* Container for reCAPTCHA if provided */}
      {container && (
        <div ref={containerRef}>
          {containerContent}
        </div>
      )}

      {/* Children content */}
      {childrenContent}
    </GoogleReCaptchaContext.Provider>
  );
};

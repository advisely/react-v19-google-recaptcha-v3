import React, { useState, useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { GoogleReCaptchaProvider } from '../google-recaptcha-provider';
import { useGoogleReCaptcha } from '../use-google-recaptcha';

// Stub grecaptcha global before tests
beforeAll(() => {
  (window as any).grecaptcha = {
    ready: (cb: () => void) => cb(),
    execute: jest.fn().mockResolvedValue('mock-token'),
  };
});

// Clean up any existing script before each test for isolation
beforeEach(() => {
  document.querySelectorAll('#google-recaptcha-v3').forEach(el => el.remove());
});

afterAll(() => {
  // Remove stubbed grecaptcha
  delete (window as any).grecaptcha;
});

// Helper component to use the recaptcha context
const TestComponent: React.FC = () => {
  const { scriptLoaded, executeRecaptcha, scriptError } = useGoogleReCaptcha();
  const [token, setToken] = useState('no-token');
  const [error, setError] = useState('');

  useEffect(() => {
    if (scriptLoaded && executeRecaptcha) {
      executeRecaptcha('test-action')
        .then(t => setToken(t))
        .catch(e => setError((e as Error).message));
    }
  }, [scriptLoaded, executeRecaptcha]);

  useEffect(() => {
    if (scriptError) setError(scriptError.message);
  }, [scriptError]);

  return (
    <>
      <div data-testid="loaded">{scriptLoaded ? 'loaded' : 'not-loaded'}</div>
      <div data-testid="token">{token}</div>
      <div data-testid="error">{error}</div>
    </>
  );
};

describe('GoogleReCaptchaProvider', () => {
  it('renders children', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('loads script and updates context on load', async () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <TestComponent />
      </GoogleReCaptchaProvider>
    );

    // The script element should now be in the document
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3');
    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect(script!.src).toContain('recaptcha/api.js');

    // Simulate script load event
    await act(async () => {
      script!.onload!(new Event('load'));
    });

    // Assert context and component updated
    expect(await screen.findByTestId('loaded')).toHaveTextContent('loaded');
    expect(await screen.findByTestId('token')).toHaveTextContent('mock-token');
  });

  it('handles script error and updates context on error', async () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <TestComponent />
      </GoogleReCaptchaProvider>
    );

    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3');
    expect(script).toBeInstanceOf(HTMLScriptElement);

    // Simulate error event
    await act(async () => {
      script!.onerror!(new Event('error'));
    });

    expect(await screen.findByTestId('error')).toHaveTextContent('ReCaptcha script failed to load');
  });
});
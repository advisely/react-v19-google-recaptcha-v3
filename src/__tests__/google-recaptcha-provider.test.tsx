import React, { useState, useEffect } from 'react';
import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
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

  it('does not inject script when inject is false', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" inject={false}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );

    expect(document.querySelector('#google-recaptcha-v3')).toBeNull();
    expect(screen.getByTestId('loaded')).toHaveTextContent('not-loaded');
  });

  it('invokes onLoad callback on successful script load', async () => {
    const onLoad = jest.fn();
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" onLoad={onLoad}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      script.onload!(new Event('load'));
    });
    expect(onLoad).toHaveBeenCalled();
  });

  it('invokes onError callback on script error', async () => {
    const onError = jest.fn();
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" onError={onError}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      script.onerror!(new Event('error'));
    });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('uses enterprise grecaptcha when useEnterprise is true', async () => {
    // Stub enterprise grecaptcha
    (window as any).grecaptcha.enterprise = {
      ready: (cb: () => void) => cb(),
      execute: jest.fn().mockResolvedValue('enterprise-token'),
    };
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" useEnterprise>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      script.onload!(new Event('load'));
    });
    expect(await screen.findByTestId('token')).toHaveTextContent('enterprise-token');
    // Clean up enterprise stub
    delete (window as any).grecaptcha.enterprise;
  });

  it('throws when grecaptcha is missing after load', async () => {
    // Remove grecaptcha stub
    delete (window as any).grecaptcha;
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      script.onload!(new Event('load'));
    });
    expect(await screen.findByTestId('error')).toHaveTextContent('grecaptcha not available');
    // Restore stub for subsequent tests
    (window as any).grecaptcha = { ready: (cb: () => void) => cb(), execute: jest.fn().mockResolvedValue('mock-token') };
  });

  it('renders static container element when container prop is provided', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" container={<div data-testid="static-container">Container</div>}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    expect(screen.getByTestId('static-container')).toBeInTheDocument();
  });

  it('calls grecaptcha.ready on refreshReCaptcha change', async () => {
    const readySpy = jest.fn(cb => cb());
    (window as any).grecaptcha.ready = readySpy;
    const { rerender } = render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" refreshReCaptcha={0}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      script.onload!(new Event('load'));
    });
    expect(readySpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender(
        <GoogleReCaptchaProvider reCaptchaKey="test-key" refreshReCaptcha={1}>
          <TestComponent />
        </GoogleReCaptchaProvider>
      );
    });
    await waitFor(() => {
      expect(readySpy).toHaveBeenCalledTimes(2);
    });
  });

  it('renders children-as-function when provided', async () => {
    const childFn = jest.fn((_execute) => <div data-testid="child-fn">Child fn</div>);
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        {childFn}
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => { script.onload!(new Event('load')); });
    expect(childFn).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByTestId('child-fn')).toBeInTheDocument();
  });

  it('renders container-as-function when provided', async () => {
    const containerFn = jest.fn((_execute) => <div data-testid="container-fn">Container fn</div>);
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" container={containerFn}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => { script.onload!(new Event('load')); });
    expect(containerFn).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByTestId('container-fn')).toBeInTheDocument();
  });

  it('handles executeRecaptcha rejection', async () => {
    // Simulate grecaptcha.execute throwing an error
    (window as any).grecaptcha.execute = jest.fn().mockRejectedValue(new Error('exec failure'));
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      script.onload!(new Event('load'));
    });
    expect(await screen.findByTestId('error')).toHaveTextContent('exec failure');
  });

  it('appends script to head by default', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    const script = document.getElementById('google-recaptcha-v3') as HTMLScriptElement;
    expect(script.parentElement).toBe(document.head);
    expect(script.async).toBe(true);
    expect(script.defer).toBe(true);
    // default nonce undefined -> no attribute
    expect(script.getAttribute('nonce')).toBeNull();
  });

  it('handles script error when event is Error instance', async () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => {
      // Pass an Error instance to error handler
      script.onerror!(new Error('custom error') as any);
    });
    expect(await screen.findByTestId('error')).toHaveTextContent('custom error');
  });

  it('sets scriptProps attributes and appends to body', () => {
    const scriptProps = { async: false, defer: false, appendTo: 'body', id: 'google-recaptcha-v3', nonce: 'test-nonce' } as any;
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" scriptProps={scriptProps}>
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    const script = document.getElementById('google-recaptcha-v3') as HTMLScriptElement;
    expect(script.parentElement).toBe(document.body);
    // nonce set via attribute
    expect(script.getAttribute('nonce')).toBe('test-nonce');
    // async/defer attributes absent when false
    expect(script.async).toBe(false);
    expect(script.defer).toBe(false);
  });

  it('removes script on unmount', () => {
    const { unmount } = render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    expect(document.getElementById('google-recaptcha-v3')).toBeInTheDocument();
    unmount();
    expect(document.getElementById('google-recaptcha-v3')).toBeNull();
  });

  it('sets scriptLoaded true immediately when script already exists before mount', async () => {
    // Pre-insert existing script to hit early-return branch
    const existing = document.createElement('script');
    existing.id = 'google-recaptcha-v3';
    document.head.appendChild(existing);
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    // Wait for effect to set scriptLoaded
    expect(await screen.findByTestId('loaded')).toHaveTextContent('loaded');
  });

  it('executeRecaptcha throws before script load', async () => {
    // Grab executeRecaptcha before script loads
    let exec: any;
    const Capture: React.FC = () => {
      const { executeRecaptcha } = useGoogleReCaptcha();
      exec = executeRecaptcha;
      return null;
    };
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        <Capture />
      </GoogleReCaptchaProvider>
    );
    expect(exec).toBeDefined();
    await expect(exec('action')).rejects.toThrow('ReCaptcha script not loaded yet');
  });

  it('uses enterprise script URL and custom language', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" useEnterprise language="fr">
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    expect(script.src).toContain('enterprise.js');
    expect(script.src).toContain('render=test-key');
    expect(script.src).toContain('hl=fr');
  });

  it('handles missing enterprise grecaptcha error', async () => {
    // Remove enterprise stub only
    delete (window as any).grecaptcha.enterprise;
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" useEnterprise>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => { script.onload!(new Event('load')); });
    expect(await screen.findByTestId('error')).toHaveTextContent('grecaptcha.enterprise not available');
    // Restore enterprise stub
    (window as any).grecaptcha.enterprise = { ready: (cb: () => void) => cb(), execute: jest.fn().mockResolvedValue('enterprise-token') };
  });

  it('allows overriding scriptProps id', () => {
    const scriptProps = { id: 'custom-id', async: true, defer: true, appendTo: 'head' } as any;
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" scriptProps={scriptProps}>
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    expect(document.getElementById('custom-id')).toBeInTheDocument();
  });

  it('useGoogleReCaptcha hook throws outside provider', () => {
    const TestHook: React.FC = () => {
      useGoogleReCaptcha();
      return null;
    };
    expect(() => render(<TestHook />)).toThrow('useGoogleReCaptcha must be used within a GoogleReCaptchaProvider');
  });

  it('does not render children function before script load', () => {
    const childFn = jest.fn(() => <div data-testid="child-before">before</div>);
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key">
        {childFn}
      </GoogleReCaptchaProvider>
    );
    expect(childFn).not.toHaveBeenCalled();
    expect(screen.queryByTestId('child-before')).toBeNull();
  });

  it('does not render container function before script load', () => {
    const containerFn = jest.fn(() => <div data-testid="container-before">before</div>);
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" container={containerFn}>
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    expect(containerFn).not.toHaveBeenCalled();
    expect(screen.queryByTestId('container-before')).toBeNull();
  });

  it('does not call grecaptcha.ready when refreshReCaptcha changed before load', () => {
    const readySpy = jest.fn(cb => cb());
    (window as any).grecaptcha.ready = readySpy;
    const { rerender } = render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" refreshReCaptcha={0}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    rerender(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" refreshReCaptcha={1}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    expect(readySpy).not.toHaveBeenCalled();
  });

  it('calls enterprise ready on refresh for enterprise', async () => {
    const readySpy = jest.fn(cb => cb());
    (window as any).grecaptcha.enterprise = { ready: readySpy, execute: jest.fn().mockResolvedValue('ent-token') };
    const { rerender } = render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" useEnterprise refreshReCaptcha={0}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.getElementById('google-recaptcha-v3') as HTMLScriptElement;
    await act(async () => script.onload!(new Event('load')));
    rerender(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" useEnterprise refreshReCaptcha={1}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    expect(readySpy).toHaveBeenCalledTimes(2);
    delete (window as any).grecaptcha.enterprise;
  });

  it('falls back to false async/defer when scriptProps missing', () => {
    const scriptProps = { appendTo: 'head', id: 'fallback-id' } as any;
    render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" scriptProps={scriptProps}>
        <div>Child</div>
      </GoogleReCaptchaProvider>
    );
    const script = document.getElementById('fallback-id') as HTMLScriptElement;
    expect(script.async).toBe(false);
    expect(script.defer).toBe(false);
  });

  it('does not call grecaptcha.ready when window.grecaptcha missing on refresh', async () => {
    // Stub grecaptcha for initial load
    const readySpy = jest.fn(cb => cb());
    (window as any).grecaptcha = { ready: readySpy, execute: jest.fn().mockResolvedValue('mock-token') };
    const { rerender } = render(
      <GoogleReCaptchaProvider reCaptchaKey="test-key" refreshReCaptcha={0}>
        <TestComponent />
      </GoogleReCaptchaProvider>
    );
    const script = document.querySelector<HTMLScriptElement>('#google-recaptcha-v3')!;
    await act(async () => { script.onload!(new Event('load')); });
    // initial ready
    expect(readySpy).toHaveBeenCalledTimes(1);
    // Remove grecaptcha to skip refresh branch
    delete (window as any).grecaptcha;
    await act(async () => {
      rerender(
        <GoogleReCaptchaProvider reCaptchaKey="test-key" refreshReCaptcha={1}>
          <TestComponent />
        </GoogleReCaptchaProvider>
      );
    });
    // ready should not be called again
    expect(readySpy).toHaveBeenCalledTimes(1);
  });
});
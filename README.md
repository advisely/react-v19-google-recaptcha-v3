# react-v19-google-recaptcha-v3
[![npm version](https://img.shields.io/npm/v/react-v19-google-recaptcha-v3.svg)](https://www.npmjs.com/package/react-v19-google-recaptcha-v3)

A modern, lightweight, and fully-typed Google reCAPTCHA v3 integration for React 19+.

## Features 🎉

- 🔄 **React 19 Compatible** - Built specifically for React 19+
- 🔒 **reCAPTCHA v3 Support** - Invisible CAPTCHA that returns a score
- 🏢 **Enterprise Support** - Works with both standard and enterprise reCAPTCHA
- 🪝 **React Hooks** - Modern API with hooks for easy integration
- 📦 **Lightweight** - Minimal bundle size
- 📱 **TypeScript Support** - Fully typed API for better developer experience
- 🔄 **Token Refresh** - Support for refreshing tokens as needed

## Installation 🚀

```bash
npm install react-v19-google-recaptcha-v3
# or
yarn add react-v19-google-recaptcha-v3
```

## Basic Usage 📝

```jsx
import React, { useCallback } from 'react';
import { 
  GoogleReCaptchaProvider, 
  useGoogleReCaptcha 
} from 'react-v19-google-recaptcha-v3';

// Form component using reCAPTCHA
const MyForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!executeRecaptcha) {
      console.log('reCAPTCHA not yet available');
      return;
    }
    
    // Get reCAPTCHA token
    const token = await executeRecaptcha('form_submit');
    
    // Send token to your server for verification
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Your form data here
        recaptchaToken: token,
      }),
    });
    
    const result = await response.json();
    console.log(result);
  }, [executeRecaptcha]);
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Your name" />
      <button type="submit">Submit</button>
    </form>
  );
};

// Root app component with provider
const App = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="YOUR_RECAPTCHA_SITE_KEY"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <h1>My Form</h1>
      <MyForm />
    </GoogleReCaptchaProvider>
  );
};

export default App;
```

## API Reference 📚

### `<GoogleReCaptchaProvider>`

The provider component that loads the reCAPTCHA script and provides context for hooks.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reCaptchaKey` | `string` | Required | Your Google reCAPTCHA site key |
| `language` | `string` | `'en'` | Language code for reCAPTCHA UI |
| `useEnterprise` | `boolean` | `false` | Whether to use reCAPTCHA Enterprise |
| `scriptProps` | `object` | See below | Script loading properties |
| `container` | `ReactNode \| Function` | `undefined` | Optional container element for reCAPTCHA |
| `children` | `ReactNode \| Function` | `undefined` | Children components or render prop |
| `onLoad` | `() => void` | `undefined` | Callback when script is loaded |
| `onError` | `(error: Error) => void` | `undefined` | Callback when script fails to load |
| `inject` | `boolean` | `true` | Whether to inject the script |
| `refreshReCaptcha` | `boolean \| number` | `false` | Value to trigger reCAPTCHA refresh |

Default `scriptProps`:
```js
{
  async: true,
  defer: true,
  appendTo: 'head',
  id: 'google-recaptcha-v3'
}
```

### `useGoogleReCaptcha()`

A hook to access the reCAPTCHA functionality from any component within the provider.

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `executeRecaptcha` | `(action: string) => Promise<string>` | Function to execute reCAPTCHA |
| `container` | `HTMLDivElement \| undefined` | Container element reference |
| `scriptLoaded` | `boolean` | Whether the script has loaded |
| `scriptError` | `Error \| null` | Error that occurred during script loading |

## Advanced Usage 🔥

### Using Enterprise reCAPTCHA

```jsx
<GoogleReCaptchaProvider
  reCaptchaKey="YOUR_ENTERPRISE_KEY"
  useEnterprise={true}
>
  <YourApp />
</GoogleReCaptchaProvider>
```

### Using with TypeScript

The package is written in TypeScript and includes all necessary type definitions:

```tsx
import React from 'react';
import { 
  GoogleReCaptchaProvider, 
  useGoogleReCaptcha,
  ExecuteRecaptcha 
} from 'react-v19-google-recaptcha-v3';

// You can use the included types
const handleRecaptchaExecution = (executeRecaptcha: ExecuteRecaptcha) => {
  executeRecaptcha('action_name').then((token: string) => {
    console.log(token);
  });
};
```

### Custom Script Loading

```jsx
<GoogleReCaptchaProvider
  reCaptchaKey="YOUR_RECAPTCHA_KEY"
  scriptProps={{
    async: true,
    defer: true,
    appendTo: 'body', // Append to body instead of head
    nonce: 'YOUR_CSP_NONCE', // For Content Security Policy
    id: 'custom-recaptcha-script-id' // Custom script ID
  }}
>
  <YourApp />
</GoogleReCaptchaProvider>
```

### Using Render Props

```jsx
<GoogleReCaptchaProvider reCaptchaKey="YOUR_RECAPTCHA_KEY">
  {(executeRecaptcha) => (
    <button 
      onClick={() => executeRecaptcha('button_click').then(token => console.log(token))}
    >
      Verify with reCAPTCHA
    </button>
  )}
</GoogleReCaptchaProvider>
```

## Server-side Verification 📊

After obtaining a token on the client side, you should verify it on your server:

```javascript
// Node.js example with Express
app.post('/api/verify-recaptcha', async (req, res) => {
  const { token } = req.body;
  
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=YOUR_SECRET_KEY&response=${token}`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  
  if (data.success && data.score >= 0.5) {
    // Token is valid and score is acceptable
    res.json({ success: true });
  } else {
    // Token is invalid or score is too low
    res.json({ success: false, message: 'reCAPTCHA verification failed' });
  }
});
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📜

MIT License 2025 Yassine Boumiza

## Author 👨‍💻

Yassine Boumiza

## GitHub Repository 📚

[https://github.com/advisely/react-v19-google-recaptcha-v3](https://github.com/advisely/react-v19-google-recaptcha-v3)
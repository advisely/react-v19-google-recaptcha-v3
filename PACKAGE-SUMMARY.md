# react-v19-google-recaptcha-v3 Package Overview

## Package Information
- **Name**: react-v19-google-recaptcha-v3
- **Version**: 1.0.0
- **Author**: Yassine Boumiza
- **Repository**: https://github.com/advisely/react-v19-google-recaptcha-v3
- **License**: MIT
- **Year**: 2025

## Description
A modern, lightweight, and fully-typed Google reCAPTCHA v3 integration specifically designed for React 19+. This package provides an easy way to integrate invisible CAPTCHA validation into your React applications.

## Key Features
- Full compatibility with React 19+
- Support for both standard and enterprise reCAPTCHA v3
- Modern React Hooks API
- Complete TypeScript support
- Lightweight with minimal dependencies
- Customizable script loading options
- Token refresh capability
- Comprehensive error handling

## Package Structure

```
react-v19-google-recaptcha-v3/
├── src/
│   ├── index.ts                    # Main entry point 
│   ├── types.ts                    # TypeScript interfaces
│   ├── context.ts                  # React context definition
│   ├── google-recaptcha-provider.tsx  # Provider component
│   ├── use-google-recaptcha.ts     # React hook
│   └── __tests__/                  # Test files
├── examples/
│   ├── basic-usage.tsx             # Example React component
│   └── server-verification.js      # Example backend verification
├── dist/                           # Compiled output (generated)
├── .github/
│   └── workflows/
│       └── build-and-test.yml      # CI/CD workflow
├── package.json                    # Package configuration
├── rollup.config.js                # Build configuration
├── tsconfig.json                   # TypeScript configuration
├── .npmignore                      # npm publish ignore list
├── LICENSE                         # MIT license
└── README.md                       # Documentation
```

## Installation

```bash
npm install react-v19-google-recaptcha-v3
# or
yarn add react-v19-google-recaptcha-v3
```

## Usage Flow

1. **Setup**: Wrap your application with `GoogleReCaptchaProvider` and provide your site key
2. **Integration**: Use the `useGoogleReCaptcha` hook in your form components
3. **Execution**: Call `executeRecaptcha(action)` during form submission to get a token
4. **Verification**: Send the token to your backend for verification with Google's API
5. **Response**: Process the form submission based on the verification result

## Dependencies
- React 19+ as a peer dependency
- No additional runtime dependencies

## Development Dependencies
- TypeScript for type checking
- Rollup for bundling
- Jest for testing
- ESLint for code quality

## Publishing Process
The package uses GitHub Actions for CI/CD:
1. Runs tests and linting on each push and pull request
2. Automatically publishes to npm when version changes and tests pass

## Next Steps
1. Clone the repository from GitHub
2. Install dependencies with `npm install`
3. Make changes as needed
4. Run tests with `npm test`
5. Build with `npm run build`
6. Publish to npm with `npm publish`

## Contact
For issues, feature requests, or contributions, please open an issue on the GitHub repository: https://github.com/advisely/react-v19-google-recaptcha-v3/issues

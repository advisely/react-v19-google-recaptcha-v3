/**
 * Server-side verification example for Google reCAPTCHA v3 tokens
 * 
 * @author Yassine Boumiza
 * @copyright 2025 Advisely
 */

// Example using Express.js
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Your reCAPTCHA secret key (keep this secure and not in your source code!)
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Minimum acceptable reCAPTCHA score (0.0 to 1.0)
const MIN_SCORE = 0.5;

/**
 * Verify a reCAPTCHA token with Google's API
 * 
 * @param {string} token - The token from the client
 * @param {string} action - Expected action name
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
async function verifyRecaptchaToken(token, action) {
  try {
    // Call the Google reCAPTCHA verify API
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();

    // Check if verification was successful
    if (!data.success) {
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${data['error-codes'].join(', ')}`,
      };
    }

    // Check if action matches expected action
    if (action && data.action !== action) {
      return {
        success: false,
        score: data.score,
        error: `Action mismatch: expected "${action}", got "${data.action}"`,
      };
    }

    // Check if score meets minimum threshold
    if (data.score < MIN_SCORE) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA score too low: ${data.score} (minimum: ${MIN_SCORE})`,
      };
    }

    // All checks passed
    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'Internal server error during verification',
    };
  }
}

/**
 * Contact form endpoint with reCAPTCHA verification
 */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;

    // Validate form input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed: No token provided',
      });
    }

    // Verify the token with the expected action
    const verification = await verifyRecaptchaToken(recaptchaToken, 'contact_form');

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.error || 'reCAPTCHA verification failed',
        score: verification.score,
      });
    }

    // If we get here, the reCAPTCHA verification was successful
    console.log(`reCAPTCHA score: ${verification.score}`);

    // Process the form submission (e.g., send email, save to database)
    // ...

    // Return success response
    return res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
    });
  }
});

// Enterprise version endpoint example
app.post('/api/enterprise/contact', async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;

    // Form validation code...

    // For Enterprise reCAPTCHA, the verification endpoint is the same,
    // but you'd need to use your Enterprise project's secret key
    const verification = await verifyRecaptchaToken(recaptchaToken, 'contact_form');
    
    // Rest of the implementation...
    
    return res.json({
      success: true,
      message: 'Thank you for your message!',
    });
  } catch (error) {
    console.error('Enterprise contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

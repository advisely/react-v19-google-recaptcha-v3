import React, { useState, useCallback } from 'react';
import { 
  GoogleReCaptchaProvider, 
  useGoogleReCaptcha 
} from 'react-v19-google-recaptcha-v3';

/**
 * Contact Form Component with reCAPTCHA validation
 * 
 * @author Yassine Boumiza
 * @copyright 2025 Advisely
 */
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<{
    submitting: boolean;
    message: string;
    success?: boolean;
  }>({
    submitting: false,
    message: ''
  });

  // Get the reCAPTCHA execution function from context
  const { executeRecaptcha, scriptLoaded } = useGoogleReCaptcha();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        submitting: false,
        message: 'Please fill out all fields',
        success: false
      });
      return;
    }
    
    // Check if reCAPTCHA is loaded
    if (!executeRecaptcha) {
      setStatus({
        submitting: false,
        message: 'reCAPTCHA not yet loaded',
        success: false
      });
      return;
    }
    
    try {
      setStatus({ submitting: true, message: 'Submitting...' });
      
      // Execute reCAPTCHA with the 'contact_form' action
      const token = await executeRecaptcha('contact_form');
      
      // In a real application, you would send this token to your server
      // for verification along with the form data
      
      // Example API call (commented out)
      /*
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit form');
      }
      */
      
      // For demo purposes, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      setFormData({ name: '', email: '', message: '' });
      setStatus({
        submitting: false,
        message: 'Thank you! Your message has been sent.',
        success: true
      });
    } catch (error) {
      setStatus({
        submitting: false,
        message: error instanceof Error ? error.message : 'An error occurred',
        success: false
      });
    }
  }, [executeRecaptcha, formData]);

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={status.submitting}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={status.submitting}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          disabled={status.submitting}
        />
      </div>
      
      {status.message && (
        <div className={`status-message ${status.success ? 'success' : 'error'}`}>
          {status.message}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={status.submitting || !scriptLoaded}
      >
        {status.submitting ? 'Submitting...' : 'Send Message'}
      </button>
      
      <div className="recaptcha-note">
        This form is protected by reCAPTCHA v3
      </div>
    </form>
  );
};

/**
 * Main App Component with reCAPTCHA Provider
 * 
 * @author Yassine Boumiza
 * @copyright 2025 Advisely
 */
const App: React.FC = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="YOUR_RECAPTCHA_SITE_KEY"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
        nonce: 'YOUR_CSP_NONCE' // Optional: for Content Security Policy
      }}
      language="en" // Optional: default is 'en'
      useEnterprise={false} // Optional: set to true for reCAPTCHA Enterprise
    >
      <div className="app-container">
        <header>
          <h1>Contact Us</h1>
          <p>Please fill out the form below to get in touch with us.</p>
        </header>
        
        <main>
          <ContactForm />
        </main>
        
        <footer>
          <p>&copy; 2025 Advisely. All rights reserved.</p>
        </footer>
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default App;
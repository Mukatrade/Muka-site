/**
 * ============================================
 * MUKA TRADE - BACKEND FORM SUBMISSION API
 * Node.js + Express Example
 * ============================================
 *
 * This backend endpoint securely handles form submissions
 * without exposing API keys to the frontend.
 *
 * Setup:
 * 1. Install dependencies: npm install express cors helmet express-rate-limit
 * 2. Set environment variables in .env
 * 3. Deploy to your backend server or Vercel Functions
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ============================================
// CONFIGURATION
// ============================================

const config = {
  WEB3FORMS_ENDPOINT: 'https://api.web3forms.com/submit',
  WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'https://mukatrade.com').split(','),
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || 3001,
};

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS - only allow your domains
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['POST', 'OPTIONS'],
}));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' })); // Limit request size

// Rate limiting
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many form submissions, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

app.use('/api/submit-form', submitLimiter);

// ============================================
// VALIDATION
// ============================================

/**
 * Validate required fields
 */
function validateFormData(data) {
  const errors = [];

  // Validate required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Invalid name');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email address');
  }

  if (!data.product || typeof data.product !== 'string' || data.product.trim().length < 3) {
    errors.push('Invalid product description');
  }

  if (!data.destination || typeof data.destination !== 'string' || data.destination.trim().length < 2) {
    errors.push('Invalid destination');
  }

  if (!data.details || typeof data.details !== 'string' || data.details.trim().length < 10) {
    errors.push('Invalid details');
  }

  // Validate optional phone if provided
  if (data.phone && !/^[\d\s\-\+\(\)]{7,}$/.test(data.phone)) {
    errors.push('Invalid phone number');
  }

  return errors;
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 2000); // Limit length
}

/**
 * Verify hCaptcha token
 */
async function verifyHCaptcha(token) {
  if (!token) return false;

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `response=${encodeURIComponent(token)}`,
    });

    const result = await response.json();
    return result.success ?? false;
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return false;
  }
}

/**
 * Submit to Web3Forms
 */
async function submitToWeb3Forms(data) {
  try {
    const formData = new URLSearchParams();

    // Add Web3Forms specific fields
    formData.append('access_key', config.WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `RFQ / Sourcing Request - ${data.product}`);
    formData.append('from_name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('company', data.company || '');
    formData.append('replyto', data.email);

    // Build message
    const message = [
      `Product/Service: ${data.product}`,
      data.qty ? `Quantity: ${data.qty}` : null,
      `Destination: ${data.destination}`,
      data.incoterm ? `Incoterm: ${data.incoterm}` : null,
      data.company ? `Company: ${data.company}` : null,
      '',
      'Details:',
      data.details,
    ]
      .filter(Boolean)
      .join('\n');

    formData.append('message', message);

    const response = await fetch(config.WEB3FORMS_ENDPOINT, {
      method: 'POST',
      body: formData,
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`Web3Forms error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: result.success ?? true,
      message: result.message || 'Form submitted successfully',
    };
  } catch (error) {
    console.error('Web3Forms submission error:', error);
    throw error;
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Form submission endpoint
 */
app.post('/api/submit-form', async (req, res) => {
  try {
    // Get IP address for logging
    const clientIp = req.ip || req.connection.remoteAddress;

    // Parse and sanitize form data
    const data = {
      name: sanitizeInput(req.body.name || ''),
      email: sanitizeInput(req.body.email || ''),
      phone: sanitizeInput(req.body.phone || ''),
      company: sanitizeInput(req.body.company || ''),
      product: sanitizeInput(req.body.product || ''),
      qty: sanitizeInput(req.body.qty || ''),
      destination: sanitizeInput(req.body.destination || ''),
      incoterm: sanitizeInput(req.body.incoterm || ''),
      details: sanitizeInput(req.body.details || ''),
      captchaToken: req.body['h-captcha-response'] || '',
    };

    // Validate form data
    const validationErrors = validateFormData(data);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Verify hCaptcha
    const captchaValid = await verifyHCaptcha(data.captchaToken);
    if (!captchaValid) {
      return res.status(400).json({
        success: false,
        message: 'Captcha verification failed',
      });
    }

    // Log submission
    console.log(`📧 Form submission from ${data.email} (IP: ${clientIp})`);

    // Submit to Web3Forms
    const result = await submitToWeb3Forms(data);

    // Success response
    res.json({
      success: true,
      message: result.message || 'Your request has been sent successfully!',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Form submission error:', error);

    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your form. Please try again later.',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

/**
 * Error Handler
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? error.message : undefined,
  });
});

// ============================================
// STARTUP
// ============================================

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`✓ API server running on port ${config.PORT}`);
    console.log(`✓ Environment: ${config.NODE_ENV}`);
  });
}

module.exports = app;

/**
 * ============================================
 * DEPLOYMENT INSTRUCTIONS
 * ============================================
 *
 * For Vercel:
 * 1. Create api/submit-form.js with this code
 * 2. Set environment variables in Vercel dashboard
 * 3. Deploy and test
 *
 * For Node.js Server:
 * 1. Create server.js with this code
 * 2. npm install express cors helmet express-rate-limit
 * 3. node server.js
 *
 * Environment Variables Required:
 * - WEB3FORMS_ACCESS_KEY (from Web3Forms)
 * - ALLOWED_ORIGINS (comma-separated domains)
 * - NODE_ENV (production/development)
 */

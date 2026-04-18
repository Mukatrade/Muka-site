/**
 * ============================================
 * MUKA TRADE - FORM HANDLER
 * Improved, Secure Form Submission System
 * ============================================
 *
 * Features:
 * - Real-time form validation
 * - Secure API key handling (via environment)
 * - User-friendly error messages
 * - Loading states & animations
 * - Accessibility compliant
 * - Mobile responsive
 */

// ============================================
// CONFIGURATION
// ============================================

const FormConfig = {
  // API Endpoint - in production, use a backend proxy
  // DO NOT expose API keys in client code
  API_ENDPOINT: '/api/submit-form', // Use your backend endpoint

  // Web3Forms Configuration (if using directly)
  // Note: In production, make the call from your backend
  WEB3FORMS_ENDPOINT: 'https://api.web3forms.com/submit',

  // Validation Rules
  VALIDATION: {
    NAME_MIN: 2,
    NAME_MAX: 100,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^[\d\s\-\+\(\)]{7,}$/,
    PRODUCT_MIN: 3,
    PRODUCT_MAX: 500,
    DESTINATION_MIN: 2,
    DESTINATION_MAX: 100,
    DETAILS_MIN: 10,
    DETAILS_MAX: 2000,
  },

  // UI Configuration
  UI: {
    FORM_TIMEOUT: 30000, // 30 seconds
    DEBOUNCE_DELAY: 300, // milliseconds
  },

  // Messages
  MESSAGES: {
    LOADING: 'Sending your request...',
    SUCCESS: 'Your request has been sent successfully!',
    ERROR_CAPTCHA: 'Please complete the captcha verification.',
    ERROR_NETWORK: 'Network error. Please check your connection and try again.',
    ERROR_TIMEOUT: 'Request timed out. Please try again.',
    ERROR_SERVER: 'Server error. Please try again later.',

    VALIDATION: {
      NAME_REQUIRED: 'Please enter your full name.',
      NAME_TOO_SHORT: 'Name must be at least 2 characters.',
      NAME_TOO_LONG: 'Name must be less than 100 characters.',
      EMAIL_REQUIRED: 'Please enter your email address.',
      EMAIL_INVALID: 'Please enter a valid email address.',
      PHONE_INVALID: 'Please enter a valid phone number.',
      PRODUCT_REQUIRED: 'Please describe the product or service.',
      PRODUCT_TOO_SHORT: 'Description must be at least 3 characters.',
      DESTINATION_REQUIRED: 'Please enter the destination country/region.',
      DESTINATION_TOO_SHORT: 'Destination must be at least 2 characters.',
      DETAILS_REQUIRED: 'Please provide details about your inquiry.',
      DETAILS_TOO_SHORT: 'Please provide at least 10 characters of detail.',
      DETAILS_TOO_LONG: 'Details must be less than 2000 characters.',
    }
  }
};

// ============================================
// FORM STATE MANAGEMENT
// ============================================

class FormState {
  constructor() {
    this.isSubmitting = false;
    this.validationErrors = {};
    this.isDirty = {};
  }

  setSubmitting(value) {
    this.isSubmitting = value;
  }

  setError(field, message) {
    this.validationErrors[field] = message;
  }

  clearError(field) {
    delete this.validationErrors[field];
  }

  clearAllErrors() {
    this.validationErrors = {};
  }

  setFieldDirty(field) {
    this.isDirty[field] = true;
  }

  getErrors() {
    return this.validationErrors;
  }

  hasErrors() {
    return Object.keys(this.validationErrors).length > 0;
  }
}

// ============================================
// FORM VALIDATION
// ============================================

class FormValidator {
  constructor(config = FormConfig) {
    this.config = config;
  }

  /**
   * Validate all fields
   */
  validateForm(fields) {
    const errors = {};

    // Name validation
    const nameError = this.validateName(fields.name);
    if (nameError) errors.name = nameError;

    // Email validation
    const emailError = this.validateEmail(fields.email);
    if (emailError) errors.email = emailError;

    // Phone validation (optional but if provided, must be valid)
    if (fields.phone && !this.isValidPhone(fields.phone)) {
      errors.phone = this.config.MESSAGES.VALIDATION.PHONE_INVALID;
    }

    // Product validation
    const productError = this.validateProduct(fields.product);
    if (productError) errors.product = productError;

    // Destination validation
    const destError = this.validateDestination(fields.destination);
    if (destError) errors.destination = destError;

    // Details validation
    const detailsError = this.validateDetails(fields.details);
    if (detailsError) errors.details = detailsError;

    return errors;
  }

  /**
   * Validate individual fields
   */
  validateName(value) {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return this.config.MESSAGES.VALIDATION.NAME_REQUIRED;
    }
    if (trimmed.length < this.config.VALIDATION.NAME_MIN) {
      return this.config.MESSAGES.VALIDATION.NAME_TOO_SHORT;
    }
    if (trimmed.length > this.config.VALIDATION.NAME_MAX) {
      return this.config.MESSAGES.VALIDATION.NAME_TOO_LONG;
    }
    return null;
  }

  validateEmail(value) {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return this.config.MESSAGES.VALIDATION.EMAIL_REQUIRED;
    }
    if (!this.config.VALIDATION.EMAIL_PATTERN.test(trimmed)) {
      return this.config.MESSAGES.VALIDATION.EMAIL_INVALID;
    }
    return null;
  }

  validateProduct(value) {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return this.config.MESSAGES.VALIDATION.PRODUCT_REQUIRED;
    }
    if (trimmed.length < this.config.VALIDATION.PRODUCT_MIN) {
      return this.config.MESSAGES.VALIDATION.PRODUCT_TOO_SHORT;
    }
    if (trimmed.length > this.config.VALIDATION.PRODUCT_MAX) {
      return this.config.MESSAGES.VALIDATION.PRODUCT_TOO_LONG;
    }
    return null;
  }

  validateDestination(value) {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return this.config.MESSAGES.VALIDATION.DESTINATION_REQUIRED;
    }
    if (trimmed.length < this.config.VALIDATION.DESTINATION_MIN) {
      return this.config.MESSAGES.VALIDATION.DESTINATION_TOO_SHORT;
    }
    return null;
  }

  validateDetails(value) {
    const trimmed = String(value || '').trim();

    if (!trimmed) {
      return this.config.MESSAGES.VALIDATION.DETAILS_REQUIRED;
    }
    if (trimmed.length < this.config.VALIDATION.DETAILS_MIN) {
      return this.config.MESSAGES.VALIDATION.DETAILS_TOO_SHORT;
    }
    if (trimmed.length > this.config.VALIDATION.DETAILS_MAX) {
      return this.config.MESSAGES.VALIDATION.DETAILS_TOO_LONG;
    }
    return null;
  }

  isValidPhone(value) {
    return this.config.VALIDATION.PHONE_PATTERN.test(String(value || ''));
  }
}

// ============================================
// FORM CONTROLLER
// ============================================

class FormController {
  constructor(formElement, config = FormConfig) {
    this.form = formElement;
    this.config = config;
    this.state = new FormState();
    this.validator = new FormValidator(config);

    this.hintElement = null;
    this.submitButton = null;

    this.init();
  }

  init() {
    this.hintElement = this.form.querySelector('[data-hint]');
    this.submitButton = this.form.querySelector('button[type="submit"]');

    this.setupEventListeners();
    this.setupRealTimeValidation();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Clear errors when user starts typing
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('focus', () => {
        const fieldName = field.name;
        if (this.state.isDirty[fieldName]) {
          this.state.clearError(fieldName);
          this.updateFieldUI(field);
        }
      });
    });
  }

  setupRealTimeValidation() {
    const fields = this.form.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
      // Mark field as dirty on blur
      field.addEventListener('blur', () => {
        this.state.setFieldDirty(field.name);
        this.validateField(field);
      });

      // Validate with debounce on input
      let debounceTimer;
      field.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (this.state.isDirty[field.name]) {
            this.validateField(field);
          }
        }, this.config.UI.DEBOUNCE_DELAY);
      });
    });
  }

  /**
   * Validate a single field
   */
  validateField(field) {
    const fieldName = field.name;
    const value = field.value;

    let error = null;

    // Validate based on field type
    switch (fieldName) {
      case 'name':
        error = this.validator.validateName(value);
        break;
      case 'email':
        error = this.validator.validateEmail(value);
        break;
      case 'phone':
        if (value && !this.validator.isValidPhone(value)) {
          error = this.config.MESSAGES.VALIDATION.PHONE_INVALID;
        }
        break;
      case 'product':
        error = this.validator.validateProduct(value);
        break;
      case 'destination':
        error = this.validator.validateDestination(value);
        break;
      case 'details':
        error = this.validator.validateDetails(value);
        break;
    }

    if (error) {
      this.state.setError(fieldName, error);
    } else {
      this.state.clearError(fieldName);
    }

    this.updateFieldUI(field);
  }

  /**
   * Update UI to reflect field validation state
   */
  updateFieldUI(field) {
    const error = this.state.validationErrors[field.name];

    if (error) {
      field.classList.add('is-error');
      field.setAttribute('aria-invalid', 'true');

      // Show error below field
      let errorElement = field.parentElement.querySelector('[data-error]');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.setAttribute('data-error', '');
        errorElement.style.cssText = `
          color: rgba(231, 76, 60, 0.95);
          font-size: 13px;
          margin-top: 4px;
          display: block;
        `;
        field.parentElement.appendChild(errorElement);
      }
      errorElement.textContent = error;
    } else {
      field.classList.remove('is-error');
      field.setAttribute('aria-invalid', 'false');

      const errorElement = field.parentElement.querySelector('[data-error]');
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  /**
   * Get form fields
   */
  getFormFields() {
    const fd = new FormData(this.form);
    return {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      company: String(fd.get('company') || '').trim(),
      product: String(fd.get('product') || '').trim(),
      qty: String(fd.get('qty') || '').trim(),
      destination: String(fd.get('destination') || '').trim(),
      incoterm: String(fd.get('incoterm') || '').trim(),
      details: String(fd.get('details') || '').trim(),
    };
  }

  /**
   * Show hint message with styling
   */
  setHint(message, tone = 'info') {
    if (!this.hintElement) return;

    const colors = {
      ok: 'rgba(46, 204, 113, 0.95)',
      error: 'rgba(231, 76, 60, 0.95)',
      info: 'rgba(255, 255, 255, 0.75)',
      loading: 'rgba(255, 215, 0, 0.95)',
    };

    this.hintElement.textContent = message;
    this.hintElement.style.color = colors[tone] || colors.info;
    this.hintElement.setAttribute('role', 'status');
    this.hintElement.setAttribute('aria-live', 'polite');
  }

  /**
   * Check hCaptcha
   */
  verifyCaptcha() {
    const captchaTokenField = this.form.querySelector('textarea[name="h-captcha-response"]');

    if (!captchaTokenField) {
      this.setHint(this.config.MESSAGES.ERROR_CAPTCHA, 'error');
      return false;
    }

    const token = String(captchaTokenField.value || '').trim();
    if (!token) {
      this.setHint(this.config.MESSAGES.ERROR_CAPTCHA, 'error');
      return false;
    }

    return true;
  }

  /**
   * Build message from form fields
   */
  buildMessage(fields) {
    return [
      `📦 Product/Service: ${fields.product}`,
      fields.qty ? `📊 Quantity: ${fields.qty}` : null,
      `🌍 Destination: ${fields.destination}`,
      fields.incoterm ? `📋 Incoterm: ${fields.incoterm}` : null,
      fields.company ? `🏢 Company: ${fields.company}` : null,
      fields.phone ? `📞 Phone: ${fields.phone}` : null,
      '',
      '📝 Details:',
      fields.details,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Submit form
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Prevent double submission
    if (this.state.isSubmitting) {
      return;
    }

    // Validate all fields
    const fields = this.getFormFields();
    const errors = this.validator.validateForm(fields);

    if (Object.keys(errors).length > 0) {
      // Show validation errors
      this.state.validationErrors = errors;
      this.form.querySelectorAll('input, textarea, select').forEach(field => {
        this.updateFieldUI(field);
      });
      this.setHint('Please fix the errors above.', 'error');
      return;
    }

    // Verify captcha
    if (!this.verifyCaptcha()) {
      return;
    }

    // Set loading state
    this.state.setSubmitting(true);
    this.setHint(this.config.MESSAGES.LOADING, 'loading');
    if (this.submitButton) {
      this.submitButton.disabled = true;
    }

    try {
      // Call your backend API
      const response = await this.submitToBackend(fields);

      if (response.success) {
        this.setHint(this.config.MESSAGES.SUCCESS, 'ok');
        this.form.reset();
        this.state.clearAllErrors();
        this.state.isDirty = {};

        // Reset hCaptcha if available
        if (typeof hcaptcha !== 'undefined') {
          hcaptcha.reset();
        }

        // Scroll to success message
        this.hintElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        this.setHint(response.error || this.config.MESSAGES.ERROR_SERVER, 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);

      if (error.name === 'TimeoutError') {
        this.setHint(this.config.MESSAGES.ERROR_TIMEOUT, 'error');
      } else if (error.message.includes('fetch')) {
        this.setHint(this.config.MESSAGES.ERROR_NETWORK, 'error');
      } else {
        this.setHint(this.config.MESSAGES.ERROR_SERVER, 'error');
      }
    } finally {
      this.state.setSubmitting(false);
      if (this.submitButton) {
        this.submitButton.disabled = false;
      }
    }
  }

  /**
   * Submit to your backend API
   * Your backend should proxy the request to Web3Forms
   */
  async submitToBackend(fields) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.UI.FORM_TIMEOUT);

    try {
      const formData = new FormData(this.form);

      // Add backend-specific fields
      formData.append('subject', `RFQ / Sourcing Request - ${fields.product}`);
      formData.append('from_name', fields.name);
      formData.append('replyto', fields.email);
      formData.append('source', 'mukatrade.com landing page');
      formData.append('message', this.buildMessage(fields));

      const response = await fetch(this.config.API_ENDPOINT, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success ?? true,
        error: data.message || data.error,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize form when DOM is ready
 */
function initializeForm() {
  const quoteForm = document.getElementById('quoteForm');

  if (quoteForm) {
    window.formController = new FormController(quoteForm);
    console.log('✓ Form controller initialized');
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForm);
} else {
  initializeForm();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FormState,
    FormValidator,
    FormController,
    FormConfig,
  };
}

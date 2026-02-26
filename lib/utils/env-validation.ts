/**
 * Environment variable validation
 * Ensures critical environment variables are properly configured
 */

export class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates TOKEN_SECRET_KEY
 * - Must exist
 * - Must be at least 32 characters (256 bits)
 * - Should be random and complex
 */
export function validateTokenSecretKey(): void {
  const key = process.env.TOKEN_SECRET_KEY;

  if (!key) {
    throw new EnvironmentValidationError(
      'TOKEN_SECRET_KEY is not defined. Please set it in your .env file.'
    );
  }

  if (key.length < 32) {
    throw new EnvironmentValidationError(
      `TOKEN_SECRET_KEY must be at least 32 characters long. Current length: ${key.length}. ` +
      'Generate a secure key using: openssl rand -base64 32'
    );
  }

  // Check if key appears to be weak (e.g., all same character, sequential)
  if (/^(.)\1+$/.test(key)) {
    throw new EnvironmentValidationError(
      'TOKEN_SECRET_KEY appears to be weak (repeated characters). ' +
      'Generate a secure key using: openssl rand -base64 32'
    );
  }

  if (/^(012|123|234|345|456|567|678|789|abc|def)+$/i.test(key)) {
    throw new EnvironmentValidationError(
      'TOKEN_SECRET_KEY appears to be weak (sequential characters). ' +
      'Generate a secure key using: openssl rand -base64 32'
    );
  }
}

/**
 * Validates all required environment variables
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Validate TOKEN_SECRET_KEY
  try {
    validateTokenSecretKey();
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      errors.push(error.message);
    }
  }

  // Validate MONGODB_URL
  if (!process.env.MONGODB_URL) {
    errors.push('MONGODB_URL is not defined. Please set it in your .env file.');
  }

  // Validate NODE_ENV
  if (!process.env.NODE_ENV) {
    console.warn('⚠️  NODE_ENV is not set. Defaulting to development mode.');
  }

  // Validate Paystack keys if in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      errors.push('PAYSTACK_SECRET_KEY is required in production.');
    }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      errors.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is required in production.');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:\n');
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`);
    });
    throw new EnvironmentValidationError(
      `Environment validation failed with ${errors.length} error(s). See console for details.`
    );
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Generate a secure random key (for development/testing)
 */
export function generateSecureKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let key = '';
  
  // Use crypto for secure random generation
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      key += chars[array[i] % chars.length];
    }
  } else if (typeof require !== 'undefined') {
    const crypto = require('crypto');
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      key += chars[bytes[i] % chars.length];
    }
  } else {
    // Fallback (not cryptographically secure)
    for (let i = 0; i < length; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return key;
}

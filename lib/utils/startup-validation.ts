/**
 * Startup validation script
 * Run this at application startup to ensure environment is properly configured
 */

import { validateEnvironment } from './env-validation';

try {
  console.log('🔍 Validating environment configuration...\n');
  validateEnvironment();
  console.log('\n✅ All environment checks passed. Application is ready to start.\n');
} catch (error) {
  console.error('\n❌ Environment validation failed. Application cannot start safely.\n');
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}

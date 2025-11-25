import dotenv from 'dotenv';

// Load environment variables from .env file
// This file should be imported FIRST before any other application modules
dotenv.config();

// Export a function to verify env vars are loaded
export function checkEnvVars() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_BOOKS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  console.log('✅ Environment variables loaded successfully');
}

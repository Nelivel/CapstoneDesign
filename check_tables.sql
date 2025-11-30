-- Check if email_verification_tokens table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'email_verification_tokens';

-- Check if email column exists in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'email';

-- If tables exist, check data
SELECT COUNT(*) as token_count FROM email_verification_tokens;
SELECT id, username, email, email_verified FROM users WHERE email IS NOT NULL;

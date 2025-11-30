-- ============================================
-- Database Schema Fix for Email Verification
-- Execute this in PostgreSQL (deskclean database)
-- ============================================

-- Step 1: Add email column to users table (nullable first, then set default)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Step 2: Add email_verified column (with default value for existing rows)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- Step 3: Add school_email column
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_email VARCHAR(255);

-- Step 4: Add school_email_verified column (with default value for existing rows)
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_email_verified BOOLEAN;
UPDATE users SET school_email_verified = FALSE WHERE school_email_verified IS NULL;
ALTER TABLE users ALTER COLUMN school_email_verified SET DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN school_email_verified SET NOT NULL;

-- Step 5: Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token_type VARCHAR(50) NOT NULL DEFAULT 'EMAIL',
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 7: Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('email', 'email_verified', 'school_email', 'school_email_verified')
ORDER BY column_name;

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'email_verification_tokens'
ORDER BY ordinal_position;

-- Step 8: Check existing data
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as users_with_email FROM users WHERE email IS NOT NULL;
SELECT COUNT(*) as verified_users FROM users WHERE email_verified = TRUE;

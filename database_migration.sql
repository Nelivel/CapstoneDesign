-- Database Migration Script for Email Verification System
-- Execute this in PostgreSQL (deskclean database)

-- 1. Add email column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Create email_verification_tokens table
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

-- 3. Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON email_verification_tokens(user_id);

-- 4. Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('email', 'email_verified', 'school_email', 'school_email_verified');

SELECT * FROM information_schema.tables WHERE table_name = 'email_verification_tokens';

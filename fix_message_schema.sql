-- ======================================
-- Fix Message Schema Migration
-- ======================================

-- Step 1: Check current state
SELECT 'Current message table structure:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'message'
ORDER BY ordinal_position;

-- Step 2: Check existing messages
SELECT 'Total messages in database:' AS info;
SELECT COUNT(*) as total_messages FROM message;

-- Step 3: Delete old messages without productId (they can't be associated with a product)
-- IMPORTANT: This deletes orphaned messages that don't know which chat room they belong to
DELETE FROM message_read_by WHERE message_id IN (SELECT id FROM message);
DELETE FROM message;

SELECT 'All old messages deleted (fresh start for chat system)' AS info;

-- Step 4: Add product_id column
ALTER TABLE message ADD COLUMN IF NOT EXISTS product_id BIGINT;

-- Step 5: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_message_product_id ON message(product_id);

-- Step 6: Verify the changes
SELECT 'Verification - product_id column added:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'message' AND column_name = 'product_id';

SELECT 'Migration complete! Backend server can now be restarted.' AS info;

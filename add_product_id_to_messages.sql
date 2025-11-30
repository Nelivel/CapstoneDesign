-- Add productId column to message table
ALTER TABLE message ADD COLUMN IF NOT EXISTS product_id BIGINT;

-- Create index for faster product-based queries
CREATE INDEX IF NOT EXISTS idx_message_product_id ON message(product_id);

-- Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'message' AND column_name = 'product_id';

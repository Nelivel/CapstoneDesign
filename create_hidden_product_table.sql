-- Hidden Product Table Creation
-- PostgreSQL Version

-- Create hidden_product table
CREATE TABLE IF NOT EXISTS hidden_product (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    hidden_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hidden_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_hidden_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX idx_hidden_user_id ON hidden_product(user_id);
CREATE INDEX idx_hidden_product_id ON hidden_product(product_id);

-- Table comments
COMMENT ON TABLE hidden_product IS 'User-specific hidden products table';
COMMENT ON COLUMN hidden_product.user_id IS 'User who hid the product';
COMMENT ON COLUMN hidden_product.product_id IS 'Hidden product ID';
COMMENT ON COLUMN hidden_product.hidden_at IS 'Timestamp when product was hidden';

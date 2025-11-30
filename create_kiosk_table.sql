-- Kiosk Transaction Table Creation
-- PostgreSQL Version

-- Create kiosk_transaction table
CREATE TABLE IF NOT EXISTS kiosk_transaction (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(6) UNIQUE NOT NULL,
    product_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    buyer_id BIGINT,
    cabinet_number INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance optimization
CREATE INDEX idx_kiosk_serial_number ON kiosk_transaction(serial_number);
CREATE INDEX idx_kiosk_product_id ON kiosk_transaction(product_id);
CREATE INDEX idx_kiosk_status ON kiosk_transaction(status);

-- Add status check constraint
ALTER TABLE kiosk_transaction
ADD CONSTRAINT chk_status
CHECK (status IN ('WAITING', 'DEPOSITED', 'PAID', 'COMPLETED', 'CANCELLED'));

-- Add cabinet number range constraint (1~8)
ALTER TABLE kiosk_transaction
ADD CONSTRAINT chk_cabinet_number
CHECK (cabinet_number IS NULL OR (cabinet_number >= 1 AND cabinet_number <= 8));

-- Table comments
COMMENT ON TABLE kiosk_transaction IS 'Kiosk non-contact trade serial number management table';
COMMENT ON COLUMN kiosk_transaction.serial_number IS '6-digit transaction serial number';
COMMENT ON COLUMN kiosk_transaction.cabinet_number IS 'Assigned cabinet number (1-8)';
COMMENT ON COLUMN kiosk_transaction.status IS 'WAITING: waiting, DEPOSITED: deposited, PAID: paid, COMPLETED: completed, CANCELLED: cancelled';
COMMENT ON COLUMN kiosk_transaction.expires_at IS 'Serial number expiration time (30 minutes after issuance)';

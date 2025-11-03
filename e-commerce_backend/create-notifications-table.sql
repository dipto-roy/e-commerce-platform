-- Create notifications table for comprehensive notification management system
-- This table stores all notifications with support for user-specific, role-based, and system-wide notifications

-- Create enum type for notification types
CREATE TYPE notification_type AS ENUM ('order', 'seller', 'system', 'payment', 'product', 'verification', 'payout');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  type notification_type DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  "actionUrl" VARCHAR(500),
  data JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_userId_read ON notifications("userId", read);
CREATE INDEX IF NOT EXISTS idx_notifications_userId_createdAt ON notifications("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_urgent ON notifications(urgent);

-- Add trigger to update updatedAt automatically
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'Stores all system notifications for users including orders, seller updates, and system messages';
COMMENT ON COLUMN notifications."userId" IS 'Foreign key reference to the user receiving the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: order, seller, system, payment, product, verification, or payout';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.urgent IS 'Whether the notification is urgent and should be highlighted';
COMMENT ON COLUMN notifications."actionUrl" IS 'Optional URL to navigate to when the notification is clicked';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data specific to the notification type';
COMMENT ON COLUMN notifications."readAt" IS 'Timestamp when the notification was marked as read';

-- Grant permissions (adjust as needed for your database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO your_app_user;

-- Sample test data (comment out for production)
-- INSERT INTO notifications ("userId", type, title, message, urgent, "actionUrl", data)
-- VALUES 
--   (1, 'order', 'Order Placed Successfully', 'Your order #12345 has been placed successfully!', false, '/orders/12345', '{"orderId": 12345, "total": 99.99}'),
--   (2, 'seller', 'New Product Order', 'You have a new order for your product!', true, '/seller/orders', '{"productId": 100, "quantity": 2}'),
--   (1, 'system', 'Welcome to the Platform', 'Thank you for joining our marketplace!', false, null, null);

-- Drop existing table
DROP TABLE IF EXISTS notifications CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- Create enum type
CREATE TYPE notification_type AS ENUM ('order', 'seller', 'system', 'payment', 'product', 'verification', 'payout');

-- Create table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  type notification_type DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  "actionUrl" VARCHAR(500),
  data JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "readAt" TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_notifications_userId ON notifications("userId");
CREATE INDEX idx_notifications_userId_read ON notifications("userId", read);
CREATE INDEX idx_notifications_userId_createdAt ON notifications("userId", "createdAt" DESC);

-- Add missing last_active_at columns

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

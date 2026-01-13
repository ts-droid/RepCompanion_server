-- Add latitude and longitude columns to gyms table
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS latitude TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS longitude TEXT;

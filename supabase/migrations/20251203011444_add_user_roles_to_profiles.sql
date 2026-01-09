/*
  # Add User Roles and Additional Fields to Profiles

  1. Changes to profiles table
    - Add `user_role` column (consumer, tester, admin, manufacturer, support)
    - Add `phone_number` column
    - Add `is_verified` column for email/account verification
    - Add `company_name` column for manufacturers

  2. Security
    - Existing RLS policies remain in place
*/

-- Add new columns to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_role text DEFAULT 'consumer';
    ALTER TABLE profiles ADD CONSTRAINT valid_user_role 
      CHECK (user_role IN ('consumer', 'tester', 'admin', 'manufacturer', 'support'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_name text;
  END IF;
END $$;

-- Create index on user_role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

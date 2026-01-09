/*
  # Comprehensive Alcohol Verification Database Schema

  Creates all tables for product management, verification, reporting, and support system.
*/

-- =====================================================
-- 1. BRANDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  manufacturer text NOT NULL,
  country_code text NOT NULL,
  website text,
  logo_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified brands"
  ON brands FOR SELECT
  USING (verified = true);

CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- =====================================================
-- 2. ALCOHOL PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS alcohol_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  verification_id text UNIQUE NOT NULL,
  batch_number text NOT NULL,
  manufacture_date date NOT NULL,
  alcohol_type text NOT NULL,
  origin_country text NOT NULL,
  qr_code_url text,
  qr_code_data text,
  is_test_product boolean DEFAULT false,
  max_scans_allowed integer DEFAULT 1,
  scan_count integer DEFAULT 0,
  status text DEFAULT 'active',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'recalled', 'expired'))
);

ALTER TABLE alcohol_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON alcohol_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can add products"
  ON alcohol_products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role IN ('admin', 'manufacturer')
    )
  );

CREATE POLICY "Creators and admins can update products"
  ON alcohol_products FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- =====================================================
-- 3. VERIFICATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES alcohol_products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  verification_id text NOT NULL,
  scan_result text NOT NULL,
  device_info jsonb,
  location text,
  ip_address text,
  scanned_at timestamptz DEFAULT now(),
  CONSTRAINT valid_scan_result CHECK (scan_result IN ('verified', 'already_scanned', 'invalid', 'counterfeit_suspected'))
);

ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification logs"
  ON verification_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create verification logs"
  ON verification_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all logs"
  ON verification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- =====================================================
-- 4. COUNTERFEIT REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS counterfeit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES alcohol_products(id) ON DELETE SET NULL,
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  verification_id text NOT NULL,
  report_type text NOT NULL,
  description text NOT NULL,
  photo_urls text[],
  location text,
  status text DEFAULT 'pending',
  admin_notes text,
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_report_type CHECK (report_type IN ('fake_qr', 'suspicious_packaging', 'already_scanned', 'other')),
  CONSTRAINT valid_report_status CHECK (status IN ('pending', 'investigating', 'confirmed', 'resolved', 'false_alarm'))
);

ALTER TABLE counterfeit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON counterfeit_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON counterfeit_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports"
  ON counterfeit_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- =====================================================
-- 5. SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ticket_number text UNIQUE NOT NULL,
  category text NOT NULL,
  subject text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('verification', 'account', 'report', 'technical', 'other')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_ticket_status CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed'))
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role IN ('admin', 'support')
    )
  );

-- =====================================================
-- 6. SUPPORT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  message text NOT NULL,
  is_staff_reply boolean DEFAULT false,
  attachments text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own tickets"
  ON support_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in own tickets"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage all messages"
  ON support_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role IN ('admin', 'support')
    )
  );

-- =====================================================
-- 7. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 8. API KEYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  name text NOT NULL,
  permissions text[] DEFAULT ARRAY['read_products'],
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Manufacturers can create API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role IN ('admin', 'manufacturer')
    )
  );

-- =====================================================
-- 9. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- =====================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_verification_id ON alcohol_products(verification_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON alcohol_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON alcohol_products(status);
CREATE INDEX IF NOT EXISTS idx_verification_logs_product_id ON verification_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_scanned_at ON verification_logs(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON counterfeit_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON counterfeit_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- 11. CREATE FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON alcohol_products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON alcohol_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON counterfeit_reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON counterfeit_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

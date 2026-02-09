-- Client Locations & Enhanced Client Profiles
-- Adds multi-location support, links research sessions to locations

-- ============================================================
-- 1. Enhance clients table
-- ============================================================

-- Add new columns to clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update status constraint to include 'active'
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients
  ADD CONSTRAINT clients_status_check
  CHECK (status IN ('draft', 'active', 'researching', 'ready', 'completed'));

-- Default status to 'active' for new records
ALTER TABLE clients ALTER COLUMN status SET DEFAULT 'active';

-- ============================================================
-- 2. Create locations table
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Location identity
  label TEXT NOT NULL,          -- e.g. "Dallas Office"
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  service_area TEXT,            -- e.g. "Dallas, TX"

  -- Optional details
  gbp_url TEXT,
  address TEXT,
  zip TEXT,
  phone TEXT,

  -- Multi-location support
  is_primary BOOLEAN DEFAULT false,

  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_client ON locations(client_id);
CREATE INDEX IF NOT EXISTS idx_locations_client_primary ON locations(client_id, is_primary);

-- Auto-update trigger
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. Add location_id to research_sessions
-- ============================================================

ALTER TABLE research_sessions
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_research_sessions_location ON research_sessions(location_id);

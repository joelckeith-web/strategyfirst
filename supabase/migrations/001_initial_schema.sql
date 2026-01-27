-- Strategy First - Initial Schema
-- Run this in Supabase SQL Editor or via CLI

-- Clients table - minimal required input
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  gbp_url TEXT,
  primary_service_area TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'researching', 'ready', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research results (raw API data from parallel research tasks)
CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- GBP data (from Google Places API via Apify)
  gbp_rating DECIMAL(2,1),
  gbp_review_count INTEGER,
  gbp_categories TEXT[],
  gbp_phone TEXT,
  gbp_address TEXT,
  gbp_hours JSONB,
  gbp_photos_count INTEGER,
  gbp_raw_data JSONB,

  -- Sitemap data (from sitemap extraction)
  sitemap_total_pages INTEGER,
  sitemap_has_service_pages BOOLEAN,
  sitemap_has_blog BOOLEAN,
  sitemap_has_location_pages BOOLEAN,
  sitemap_page_types JSONB, -- { service: 5, blog: 12, location: 3, ... }

  -- Website data (from website crawler)
  website_cms TEXT,
  website_has_ssl BOOLEAN,
  website_is_mobile_responsive BOOLEAN,
  website_has_structured_data BOOLEAN,
  website_description TEXT,
  website_schema_types TEXT[],
  website_raw_data JSONB,

  -- Competitors (from competitor search)
  competitors JSONB, -- Array of competitor objects with their metrics

  -- Task status tracking for UI progress
  gbp_status TEXT DEFAULT 'pending' CHECK (gbp_status IN ('pending', 'running', 'completed', 'failed')),
  sitemap_status TEXT DEFAULT 'pending' CHECK (sitemap_status IN ('pending', 'running', 'completed', 'failed')),
  website_status TEXT DEFAULT 'pending' CHECK (website_status IN ('pending', 'running', 'completed', 'failed')),
  competitors_status TEXT DEFAULT 'pending' CHECK (competitors_status IN ('pending', 'running', 'completed', 'failed')),

  -- Error messages for failed tasks
  gbp_error TEXT,
  sitemap_error TEXT,
  website_error TEXT,
  competitors_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_id) -- One research result per client
);

-- Analyses table (final results after verification)
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  intake_data JSONB NOT NULL, -- Full intake form data (68 fields)
  results JSONB, -- Analysis results (SEO scores, recommendations, etc.)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created ON clients(created_at DESC);
CREATE INDEX idx_research_client ON research_results(client_id);
CREATE INDEX idx_analyses_client ON analyses(client_id);
CREATE INDEX idx_analyses_status ON analyses(status);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER research_results_updated_at
  BEFORE UPDATE ON research_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (optional - enable when auth is added)
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

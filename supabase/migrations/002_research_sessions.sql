-- Research Sessions table for n8n workflow tracking
-- This table stores the state of research sessions triggered via n8n

CREATE TABLE research_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to client (optional - session can exist before client record)
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Input data from the trigger request
  input JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "businessName": "string",
  --   "website": "string",
  --   "city": "string?",
  --   "state": "string?",
  --   "serviceAreas": "string[]?",
  --   "industry": "string?",
  --   "primaryServices": "string[]?"
  -- }

  -- Session status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'partial', 'failed', 'timeout')),

  -- Progress tracking
  progress JSONB DEFAULT '{"currentStep": "initializing", "completedSteps": [], "failedSteps": [], "percentage": 0}'::jsonb,

  -- Research results (populated by callbacks)
  results JSONB DEFAULT '{}'::jsonb,
  -- Expected structure matches ResearchResults type:
  -- {
  --   "gbp": GBPData | null,
  --   "competitors": CompetitorData[],
  --   "seoAudit": SEOAuditData | null,
  --   "sitemap": SitemapData | null,
  --   "websiteCrawl": WebsiteCrawlData | null,
  --   "citations": CitationData[]
  -- }

  -- Errors collected during research
  errors JSONB DEFAULT '[]'::jsonb,

  -- n8n execution tracking
  n8n_execution_id TEXT,
  callback_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_research_sessions_status ON research_sessions(status);
CREATE INDEX idx_research_sessions_client ON research_sessions(client_id);
CREATE INDEX idx_research_sessions_created ON research_sessions(created_at DESC);

-- Auto-update trigger
CREATE TRIGGER research_sessions_updated_at
  BEFORE UPDATE ON research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE research_sessions;

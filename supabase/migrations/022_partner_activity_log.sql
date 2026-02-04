-- Partner activity log for tracking status changes, suspensions, reactivations, etc.

CREATE TABLE IF NOT EXISTS partner_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'created', 'approved', 'suspended', 'reactivated', 'rejected', 'edited'
  performed_by_admin BOOLEAN DEFAULT true,
  previous_status TEXT, -- status before the change
  new_status TEXT, -- status after the change
  reason TEXT, -- suspension/rejection reason
  notes TEXT, -- any additional notes
  metadata JSONB DEFAULT '{}', -- additional data (e.g., what fields were edited)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_partner_activity_log_partner_id ON partner_activity_log(partner_id);
CREATE INDEX idx_partner_activity_log_activity_type ON partner_activity_log(activity_type);
CREATE INDEX idx_partner_activity_log_created_at ON partner_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE partner_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role access for partner_activity_log" ON partner_activity_log
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE partner_activity_log IS 'Tracks all status changes and activity for partners';

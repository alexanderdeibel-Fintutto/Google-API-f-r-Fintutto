-- ============================================================================
-- BREVO EMAIL EVENTS - Tracking table for webhook events
-- ============================================================================

-- Email Events Table
CREATE TABLE IF NOT EXISTS brevo_email_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    template_id INTEGER,
    subject TEXT,
    link_url TEXT,
    bounce_reason TEXT,
    event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_brevo_email_events_email ON brevo_email_events(email);
CREATE INDEX IF NOT EXISTS idx_brevo_email_events_type ON brevo_email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_brevo_email_events_date ON brevo_email_events(event_date);

-- Add new columns to user_profiles for email tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_bounce_reason TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS spam_complaint BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS inactive_14_notified TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS inactive_30_notified TIMESTAMPTZ;

-- Add new columns to subscriptions for lifecycle tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ending_notified TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS winback_30_sent TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS winback_90_sent TIMESTAMPTZ;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE brevo_email_events ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on brevo_email_events"
    ON brevo_email_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can only view their own events
CREATE POLICY "Users can view own email events"
    ON brevo_email_events
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt() ->> 'email');

-- ============================================================================
-- Views for Analytics
-- ============================================================================

-- Email engagement summary per user
CREATE OR REPLACE VIEW email_engagement_summary AS
SELECT
    email,
    COUNT(*) FILTER (WHERE event_type = 'opened') AS opens,
    COUNT(*) FILTER (WHERE event_type = 'clicked') AS clicks,
    COUNT(*) FILTER (WHERE event_type IN ('hard_bounce', 'soft_bounce')) AS bounces,
    COUNT(*) FILTER (WHERE event_type = 'unsubscribed') AS unsubscribes,
    MAX(event_date) AS last_engagement,
    MIN(event_date) AS first_engagement
FROM brevo_email_events
GROUP BY email;

-- Daily email stats
CREATE OR REPLACE VIEW daily_email_stats AS
SELECT
    DATE(event_date) AS date,
    event_type,
    COUNT(*) AS count
FROM brevo_email_events
GROUP BY DATE(event_date), event_type
ORDER BY date DESC, event_type;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to check if user is engaged (opened email in last 30 days)
CREATE OR REPLACE FUNCTION is_email_engaged(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM brevo_email_events
        WHERE email = user_email
        AND event_type IN ('opened', 'clicked')
        AND event_date > NOW() - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get bounce status
CREATE OR REPLACE FUNCTION get_bounce_status(user_email TEXT)
RETURNS TABLE (
    has_bounced BOOLEAN,
    is_hard_bounce BOOLEAN,
    bounce_reason TEXT,
    bounce_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE AS has_bounced,
        event_type = 'hard_bounce' AS is_hard_bounce,
        brevo_email_events.bounce_reason,
        event_date AS bounce_date
    FROM brevo_email_events
    WHERE email = user_email
    AND event_type IN ('hard_bounce', 'soft_bounce')
    ORDER BY event_date DESC
    LIMIT 1;

    -- Return empty if no bounce
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, FALSE, NULL::TEXT, NULL::TIMESTAMPTZ;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

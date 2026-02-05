-- ============================================================================
-- FINTUTTO BREVO INTEGRATION - Supabase Migration
-- ============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks/sql
-- ============================================================================

-- ============================================================================
-- 1. BREVO SYNC LOG TABLE
-- Tracks all syncs with Brevo for debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS brevo_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    response JSONB,
    success BOOLEAN DEFAULT false,
    error_message TEXT
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_brevo_sync_log_user ON brevo_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_brevo_sync_log_email ON brevo_sync_log(email);
CREATE INDEX IF NOT EXISTS idx_brevo_sync_log_event ON brevo_sync_log(event_type);
CREATE INDEX IF NOT EXISTS idx_brevo_sync_log_created ON brevo_sync_log(created_at DESC);

-- ============================================================================
-- 2. USER PROFILES TABLE (falls noch nicht vorhanden)
-- Erweitert um Brevo-spezifische Felder
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,

    -- Brevo/Marketing Felder
    persona TEXT CHECK (persona IN ('P01', 'P02', 'P03', 'P04', 'P05', 'P09', 'P10', 'C1', 'C2', 'C3', 'D1')),
    product TEXT CHECK (product IN ('vermietify', 'mieterapp', 'hausmeisterpro', 'rechner', 'stb_portal', 'makler_portal', 'fintutto')),
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
    subscription_plan TEXT,

    -- Tracking
    objects_count INTEGER DEFAULT 0,
    tenants_count INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    brevo_synced_at TIMESTAMPTZ,

    -- Referral
    referral_code TEXT UNIQUE,
    referred_by TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_persona ON user_profiles(persona);
CREATE INDEX IF NOT EXISTS idx_user_profiles_product ON user_profiles(product);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(subscription_status);

-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Stripe Integration
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,

    -- Status
    status TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'past_due')),
    plan TEXT,

    -- Dates
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- 4. PROPERTIES/OBJECTS TABLE (für Vermietify)
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Property Details
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'commercial', 'garage', 'other')),

    -- Rental Info
    rent_amount DECIMAL(10,2),
    size_sqm DECIMAL(10,2),
    rooms INTEGER,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'vacant', 'sold', 'archived')),

    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);

-- ============================================================================
-- 5. TENANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Relations
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Vermieter
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    tenant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Falls Mieter auch User ist

    -- Tenant Details
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,

    -- Contract
    move_in_date DATE,
    move_out_date DATE,
    rent_amount DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('invited', 'active', 'moved_out')),
    invited_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tenants_user ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);

-- ============================================================================
-- 6. CALCULATOR USAGE TABLE (für Lead-Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS calculator_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- User (optional - kann auch anonym sein)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,  -- Für Lead-Capture

    -- Calculator Details
    calculator_type TEXT NOT NULL,
    input_data JSONB,
    result_data JSONB,

    -- Tracking
    session_id TEXT,
    ip_hash TEXT,  -- Gehashte IP für Anonymität
    user_agent TEXT,
    referrer TEXT,

    -- Conversion
    converted_to_signup BOOLEAN DEFAULT false,
    converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calculator_usage_email ON calculator_usage(email);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_type ON calculator_usage(calculator_type);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_created ON calculator_usage(created_at DESC);

-- ============================================================================
-- 7. HELPER FUNCTION: Call Brevo Edge Function
-- ============================================================================
CREATE OR REPLACE FUNCTION call_brevo_event(
    p_event TEXT,
    p_email TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_response JSONB;
    v_url TEXT;
BEGIN
    v_url := 'https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/brevo-events';

    -- Log the attempt
    INSERT INTO brevo_sync_log (email, event_type, payload)
    VALUES (p_email, p_event, jsonb_build_object('event', p_event, 'email', p_email, 'data', p_data));

    -- Note: Actual HTTP call needs to be done via Edge Function or pg_net extension
    -- This function prepares the payload
    RETURN jsonb_build_object(
        'event', p_event,
        'email', p_email,
        'data', p_data,
        'url', v_url
    );
END;
$$;

-- ============================================================================
-- 8. TRIGGER: Sync new users to Brevo
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_user_to_brevo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
    v_persona TEXT;
    v_product TEXT;
BEGIN
    -- Get email from auth.users
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;

    -- Determine persona (default P01 for new users)
    v_persona := COALESCE(NEW.persona, 'P01');
    v_product := COALESCE(NEW.product, 'vermietify');

    -- Log sync attempt
    INSERT INTO brevo_sync_log (user_id, email, event_type, payload)
    VALUES (
        NEW.id,
        v_email,
        'user.registered',
        jsonb_build_object(
            'firstName', NEW.first_name,
            'lastName', NEW.last_name,
            'persona', v_persona,
            'product', v_product
        )
    );

    -- Update brevo_synced_at
    NEW.brevo_synced_at := NOW();

    RETURN NEW;
END;
$$;

-- Trigger für neue User
DROP TRIGGER IF EXISTS trigger_sync_user_to_brevo ON user_profiles;
CREATE TRIGGER trigger_sync_user_to_brevo
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_brevo();

-- ============================================================================
-- 9. TRIGGER: Track subscription changes
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_subscription_to_brevo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
    v_event TEXT;
BEGIN
    -- Get user email
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;

    -- Determine event type
    IF TG_OP = 'INSERT' THEN
        v_event := 'subscription.created';
    ELSIF OLD.status != NEW.status THEN
        IF NEW.status = 'cancelled' THEN
            v_event := 'subscription.cancelled';
        ELSIF NEW.status = 'active' AND OLD.status = 'trial' THEN
            v_event := 'subscription.created';
        ELSE
            v_event := 'subscription.updated';
        END IF;
    ELSE
        RETURN NEW;
    END IF;

    -- Log sync
    INSERT INTO brevo_sync_log (user_id, email, event_type, payload)
    VALUES (
        NEW.user_id,
        v_email,
        v_event,
        jsonb_build_object(
            'subscriptionPlan', NEW.plan,
            'status', NEW.status
        )
    );

    -- Update user profile
    UPDATE user_profiles
    SET subscription_status = NEW.status,
        subscription_plan = NEW.plan,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_subscription_to_brevo ON subscriptions;
CREATE TRIGGER trigger_sync_subscription_to_brevo
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_subscription_to_brevo();

-- ============================================================================
-- 10. TRIGGER: Track property count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_property_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_email TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT COUNT(*) INTO v_count FROM properties WHERE user_id = OLD.user_id;
        UPDATE user_profiles SET objects_count = v_count, updated_at = NOW() WHERE id = OLD.user_id;
        RETURN OLD;
    ELSE
        SELECT COUNT(*) INTO v_count FROM properties WHERE user_id = NEW.user_id;
        UPDATE user_profiles SET objects_count = v_count, updated_at = NOW() WHERE id = NEW.user_id;

        -- Log for Brevo sync
        SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
        INSERT INTO brevo_sync_log (user_id, email, event_type, payload)
        VALUES (NEW.user_id, v_email, 'object.created', jsonb_build_object('objectsCount', v_count));

        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_property_count ON properties;
CREATE TRIGGER trigger_update_property_count
    AFTER INSERT OR DELETE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_property_count();

-- ============================================================================
-- 11. TRIGGER: Track tenant count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_tenant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_email TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT COUNT(*) INTO v_count FROM tenants WHERE user_id = OLD.user_id;
        UPDATE user_profiles SET tenants_count = v_count, updated_at = NOW() WHERE id = OLD.user_id;
        RETURN OLD;
    ELSE
        SELECT COUNT(*) INTO v_count FROM tenants WHERE user_id = NEW.user_id;
        UPDATE user_profiles SET tenants_count = v_count, updated_at = NOW() WHERE id = NEW.user_id;

        -- Log for Brevo sync
        SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
        INSERT INTO brevo_sync_log (user_id, email, event_type, payload)
        VALUES (NEW.user_id, v_email, 'tenant.created', jsonb_build_object('tenantsCount', v_count));

        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_tenant_count ON tenants;
CREATE TRIGGER trigger_update_tenant_count
    AFTER INSERT OR DELETE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_count();

-- ============================================================================
-- 12. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_sync_log ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Properties: Users can manage their own properties
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

-- Tenants: Users can manage their own tenants
CREATE POLICY "Users can view own tenants" ON tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tenants" ON tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tenants" ON tenants FOR DELETE USING (auth.uid() = user_id);

-- Calculator Usage: Public insert, users can view their own
CREATE POLICY "Anyone can log calculator usage" ON calculator_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own calculator usage" ON calculator_usage FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Brevo Sync Log: Only service role can access
CREATE POLICY "Service role only for brevo_sync_log" ON brevo_sync_log FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 13. VIEWS for Analytics
-- ============================================================================

-- User Overview with Brevo Status
CREATE OR REPLACE VIEW v_user_brevo_status AS
SELECT
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.persona,
    up.product,
    up.subscription_status,
    up.objects_count,
    up.tenants_count,
    up.brevo_synced_at,
    up.created_at,
    (SELECT COUNT(*) FROM brevo_sync_log WHERE user_id = up.id AND success = true) as successful_syncs,
    (SELECT MAX(created_at) FROM brevo_sync_log WHERE user_id = up.id) as last_sync_attempt
FROM user_profiles up;

-- Pending Brevo Syncs (for cron job processing)
CREATE OR REPLACE VIEW v_pending_brevo_syncs AS
SELECT
    bsl.*,
    up.first_name,
    up.last_name,
    up.persona,
    up.product
FROM brevo_sync_log bsl
LEFT JOIN user_profiles up ON up.id = bsl.user_id
WHERE bsl.success = false
ORDER BY bsl.created_at ASC;

-- ============================================================================
-- DONE!
-- ============================================================================
--
-- Nach dem Ausführen dieser Migration:
-- 1. Die Edge Functions (brevo-core, brevo-events) verarbeiten die Events
-- 2. Alle User-Aktionen werden automatisch geloggt
-- 3. Ein Cron Job sollte v_pending_brevo_syncs abarbeiten
--
-- ============================================================================

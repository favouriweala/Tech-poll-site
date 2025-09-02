-- =====================================================
-- Supabase Database Schema for ALX Polly Application
-- =====================================================
-- This file contains the complete database schema for the poll application
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Extends the auth.users table with additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLLS TABLE
-- =====================================================
-- Main polls table storing poll information
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL CHECK (length(title) > 0),
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    allow_multiple_selections BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_end_date CHECK (end_date IS NULL OR end_date > created_at)
);

-- Enable RLS on polls
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view public polls" ON public.polls
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view own polls" ON public.polls
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own polls" ON public.polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own polls" ON public.polls
    FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- POLL_OPTIONS TABLE
-- =====================================================
-- Stores the individual options for each poll
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL CHECK (length(text) > 0),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique order within each poll
    UNIQUE(poll_id, order_index)
);

-- Enable RLS on poll_options
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

-- Poll options policies (inherit from polls)
CREATE POLICY "Anyone can view options for public polls" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.is_public = TRUE
        )
    );

CREATE POLICY "Users can view options for own polls" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create options for own polls" ON public.poll_options
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update options for own polls" ON public.poll_options
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete options for own polls" ON public.poll_options
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

-- =====================================================
-- VOTES TABLE
-- =====================================================
-- Stores individual votes on poll options
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    voter_ip INET, -- For anonymous voting
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate votes (unless multiple selections allowed)
    -- This constraint will be enforced at the application level for polls that allow multiple selections
    UNIQUE(poll_id, user_id, option_id),
    
    -- Ensure either user_id or voter_ip is provided
    CONSTRAINT vote_identity_check CHECK (
        (user_id IS NOT NULL) OR (voter_ip IS NOT NULL)
    )
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Votes policies
CREATE POLICY "Users can view votes for public polls" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = votes.poll_id 
            AND polls.is_public = TRUE
        )
    );

CREATE POLICY "Users can view votes for own polls" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = votes.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view own votes" ON public.votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create votes" ON public.votes
    FOR INSERT WITH CHECK (
        -- Can vote if poll is public and active
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = votes.poll_id 
            AND polls.is_public = TRUE
            AND polls.is_active = TRUE
            AND (polls.end_date IS NULL OR polls.end_date > NOW())
        )
        -- And if authenticated, user_id matches auth.uid()
        AND (votes.user_id IS NULL OR votes.user_id = auth.uid())
    );

CREATE POLICY "Users can update own votes" ON public.votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.votes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================
-- Performance indexes for common queries

-- Polls indexes
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_is_public ON public.polls(is_public);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_end_date ON public.polls(end_date);

-- Poll options indexes
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_order ON public.poll_options(poll_id, order_index);

-- Votes indexes
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON public.votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_ip ON public.votes(voter_ip);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON public.polls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for poll statistics
CREATE OR REPLACE VIEW public.poll_stats AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.created_by,
    p.is_public,
    p.is_active,
    p.created_at,
    p.end_date,
    COUNT(DISTINCT po.id) as option_count,
    COUNT(DISTINCT v.id) as total_votes,
    COUNT(DISTINCT v.user_id) as unique_voters
FROM public.polls p
LEFT JOIN public.poll_options po ON p.id = po.poll_id
LEFT JOIN public.votes v ON p.id = v.poll_id
GROUP BY p.id, p.title, p.description, p.created_by, p.is_public, p.is_active, p.created_at, p.end_date;

-- View for poll results
CREATE OR REPLACE VIEW public.poll_results AS
SELECT 
    p.id as poll_id,
    p.title as poll_title,
    po.id as option_id,
    po.text as option_text,
    po.order_index,
    COUNT(v.id) as vote_count,
    ROUND(
        CASE 
            WHEN total_votes.count > 0 THEN 
                (COUNT(v.id)::DECIMAL / total_votes.count) * 100 
            ELSE 0 
        END, 2
    ) as vote_percentage
FROM public.polls p
LEFT JOIN public.poll_options po ON p.id = po.poll_id
LEFT JOIN public.votes v ON po.id = v.option_id
CROSS JOIN (
    SELECT p2.id as poll_id, COUNT(v2.id) as count
    FROM public.polls p2
    LEFT JOIN public.votes v2 ON p2.id = v2.poll_id
    GROUP BY p2.id
) total_votes
WHERE total_votes.poll_id = p.id
GROUP BY p.id, p.title, po.id, po.text, po.order_index, total_votes.count
ORDER BY p.id, po.order_index;

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user can vote on a poll
CREATE OR REPLACE FUNCTION public.can_vote_on_poll(poll_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    poll_record RECORD;
    existing_votes INTEGER;
BEGIN
    -- Get poll information
    SELECT * INTO poll_record FROM public.polls WHERE id = poll_uuid;
    
    -- Check if poll exists and is active
    IF NOT FOUND OR NOT poll_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Check if poll has ended
    IF poll_record.end_date IS NOT NULL AND poll_record.end_date <= NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- If user is provided, check for existing votes
    IF user_uuid IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_votes 
        FROM public.votes 
        WHERE poll_id = poll_uuid AND user_id = user_uuid;
        
        -- If multiple selections not allowed and user already voted
        IF NOT poll_record.allow_multiple_selections AND existing_votes > 0 THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================
-- Uncomment the following section if you want to insert sample data

/*
-- Insert sample poll (you'll need to replace the UUIDs with actual user IDs)
INSERT INTO public.polls (title, description, created_by, allow_multiple_selections, is_public) 
VALUES (
    'What is your favorite programming language?',
    'Help us understand the preferences of our developer community.',
    'your-user-uuid-here', -- Replace with actual user UUID
    false,
    true
);

-- Insert sample options (replace poll-uuid with the actual poll UUID)
INSERT INTO public.poll_options (poll_id, text, order_index) VALUES
('poll-uuid-here', 'JavaScript', 0),
('poll-uuid-here', 'Python', 1),
('poll-uuid-here', 'TypeScript', 2),
('poll-uuid-here', 'Go', 3),
('poll-uuid-here', 'Rust', 4);
*/

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Remember to set up your environment variables in your Next.js app:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY (for server-side operations)
--
-- 2. The schema supports both authenticated and anonymous voting
--    Anonymous votes are tracked by IP address
--
-- 3. Row Level Security (RLS) is enabled on all tables
--    This ensures data security at the database level
--
-- 4. The schema includes performance indexes for common queries
--
-- 5. Views are provided for easy querying of poll statistics and results
--
-- 6. All timestamps are stored in UTC (TIMESTAMPTZ)
--
-- 7. The schema is designed to be scalable and supports:
--    - Multiple poll options
--    - Single or multiple choice polls
--    - Public and private polls
--    - Time-limited polls
--    - Anonymous and authenticated voting

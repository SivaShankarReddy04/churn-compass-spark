-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spotify_users table for churn data
CREATE TABLE public.spotify_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('Free', 'Premium')),
    age INTEGER NOT NULL,
    country TEXT NOT NULL,
    avg_listening_hours_per_week DECIMAL(10,2) NOT NULL,
    login_frequency_per_week INTEGER NOT NULL,
    songs_skipped_per_week INTEGER NOT NULL,
    playlists_created INTEGER NOT NULL,
    days_since_last_login INTEGER NOT NULL,
    monthly_spend_usd DECIMAL(10,2) NOT NULL,
    churn INTEGER NOT NULL CHECK (churn IN (0, 1)),
    risk_category TEXT NOT NULL CHECK (risk_category IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_filters table for user preferences
CREATE TABLE public.saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filter_name TEXT NOT NULL,
    risk_filter TEXT DEFAULT 'all',
    subscription_filter TEXT DEFAULT 'all',
    country_filter TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Spotify users policies - allow authenticated users to read
CREATE POLICY "Authenticated users can view spotify data"
ON public.spotify_users FOR SELECT
TO authenticated
USING (true);

-- Saved filters policies
CREATE POLICY "Users can view their own saved filters"
ON public.saved_filters FOR SELECT
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own saved filters"
ON public.saved_filters FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own saved filters"
ON public.saved_filters FOR DELETE
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
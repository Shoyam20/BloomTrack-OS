-- Schema for BloomTrack OS (Supabase)

-- 1. Create tables

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TEXT NOT NULL,
    priority TEXT NOT NULL,
    goal_id TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    completed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    deadline TEXT NOT NULL,
    flower_type TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    description TEXT,
    milestones JSONB DEFAULT '[]'::jsonb,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    task_id TEXT
);

-- AI Study Plans Table (Optional, for storing plans)
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    roadmap JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    milestones JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Tasks Policies
CREATE POLICY "Users can only read their own tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Goals Policies
CREATE POLICY "Users can only read their own goals" 
ON public.goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own goals" 
ON public.goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own goals" 
ON public.goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own goals" 
ON public.goals FOR DELETE 
USING (auth.uid() = user_id);

-- Focus Sessions Policies
CREATE POLICY "Users can only read their own focus sessions" 
ON public.focus_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own focus sessions" 
ON public.focus_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own focus sessions" 
ON public.focus_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own focus sessions" 
ON public.focus_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- Plans Policies
CREATE POLICY "Users can only read their own plans" 
ON public.plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own plans" 
ON public.plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own plans" 
ON public.plans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own plans" 
ON public.plans FOR DELETE 
USING (auth.uid() = user_id);

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    profession TEXT NOT NULL, -- 'School Student' | 'College Student' | 'Working Professional' | 'Entrepreneur' | 'Other'
    
    -- School Student fields
    school_name TEXT,
    grade TEXT,
    board TEXT,
    
    -- College Student fields
    college_name TEXT,
    degree TEXT,
    branch TEXT,
    year TEXT,
    
    -- Working Professional fields
    company_name TEXT,
    job_role TEXT,
    experience INTEGER,
    
    -- Entrepreneur fields
    startup_name TEXT,
    industry TEXT,
    stage TEXT,
    
    -- Other
    description TEXT,
    
    -- Goals
    goals TEXT[] DEFAULT '{}'::TEXT[],
    daily_hours INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only read their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can only insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to automatically create profile on signup from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    profession,
    school_name,
    grade,
    board,
    college_name,
    degree,
    branch,
    year,
    company_name,
    job_role,
    experience,
    startup_name,
    industry,
    stage,
    description,
    goals,
    daily_hours
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'profession', 'Other'),
    new.raw_user_meta_data->>'school_name',
    new.raw_user_meta_data->>'grade',
    new.raw_user_meta_data->>'board',
    new.raw_user_meta_data->>'college_name',
    new.raw_user_meta_data->>'degree',
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'job_role',
    COALESCE((new.raw_user_meta_data->>'experience')::INTEGER, 0),
    new.raw_user_meta_data->>'startup_name',
    new.raw_user_meta_data->>'industry',
    new.raw_user_meta_data->>'stage',
    new.raw_user_meta_data->>'description',
    CASE 
      WHEN new.raw_user_meta_data->'goals' IS NOT NULL AND jsonb_typeof(new.raw_user_meta_data->'goals') = 'array' 
      THEN ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'goals'))
      ELSE '{}'::text[]
    END,
    COALESCE((new.raw_user_meta_data->>'daily_hours')::INTEGER, 0)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

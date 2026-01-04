-- Recreate admin_roles to match the provided data structure
-- Run this in Supabase SQL Editor

DROP TABLE IF EXISTS public.admin_roles CASCADE;

CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    granted_by UUID, -- Could be a user ID or text
    granted_at TIMESTAMPTZ DEFAULT NOW()
);

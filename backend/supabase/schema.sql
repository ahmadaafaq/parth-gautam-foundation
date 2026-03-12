-- ============================================================
-- Parth Gautam Foundation – Supabase Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  age_group TEXT NOT NULL,
  ward TEXT NOT NULL,
  occupation TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  citizen_id TEXT UNIQUE NOT NULL,
  volunteer_points INT DEFAULT 0,
  programs_attended INT DEFAULT 0,
  community_reports INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  location TEXT NOT NULL,
  ward TEXT NOT NULL,
  date TEXT,
  seats_available INT,
  image TEXT,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  ward TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_ward ON programs(ward);
CREATE INDEX IF NOT EXISTS idx_issues_ward ON issues(ward);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(user_id, session_id);

-- ============================================================
-- RPC Helper: safely increment community_reports for a user
-- Called from Node.js after creating an issue
-- ============================================================
CREATE OR REPLACE FUNCTION increment_community_reports(uid UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE users SET community_reports = community_reports + 1 WHERE id = uid;
$$;


-- School Communication App — Supabase Schema
-- Idempotent: safe to run multiple times on an existing database.

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'teacher', 'admin')),
  avatar_url TEXT,
  expo_push_token TEXT,
  notification_preferences JSONB NOT NULL DEFAULT '{"school_notices": true, "teacher_updates": true, "community_chat": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─── Groups ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'class' CHECK (type IN ('class', 'year', 'activity', 'parent-community')),
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Group Memberships ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role_in_group TEXT NOT NULL DEFAULT 'member' CHECK (role_in_group IN ('member', 'owner', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- ─── Notices ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL CHECK (author_role IN ('admin', 'teacher')),
  audience_type TEXT NOT NULL DEFAULT 'school-wide' CHECK (audience_type IN ('school-wide', 'group')),
  audience_ids UUID[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS notices_updated_at ON notices;
CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ─── Notice Reads ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notice_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notice_id)
);

-- ─── Blog Posts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('school-life', 'principal-update', 'events', 'achievements', 'general')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Info Pages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS info_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'contact', 'schedules', 'policies', 'facilities', 'links')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Chats ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Chat Memberships ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_chat TEXT NOT NULL DEFAULT 'member' CHECK (role_in_chat IN ('member', 'owner')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- ─── Messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ─── Policies ────────────────────────────────────────────────────────────────
-- Drop all policies first so they can be recreated cleanly.

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;

DROP POLICY IF EXISTS "memberships_select" ON group_memberships;
DROP POLICY IF EXISTS "memberships_insert" ON group_memberships;
DROP POLICY IF EXISTS "memberships_delete" ON group_memberships;

DROP POLICY IF EXISTS "notices_select" ON notices;
DROP POLICY IF EXISTS "notices_insert" ON notices;
DROP POLICY IF EXISTS "notices_update" ON notices;

DROP POLICY IF EXISTS "notice_reads_select" ON notice_reads;
DROP POLICY IF EXISTS "notice_reads_insert" ON notice_reads;

DROP POLICY IF EXISTS "blog_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_insert" ON blog_posts;

DROP POLICY IF EXISTS "info_select" ON info_pages;
DROP POLICY IF EXISTS "info_insert" ON info_pages;
DROP POLICY IF EXISTS "info_update" ON info_pages;

DROP POLICY IF EXISTS "chats_select" ON chats;
DROP POLICY IF EXISTS "chats_insert" ON chats;

DROP POLICY IF EXISTS "chat_memberships_select" ON chat_memberships;
DROP POLICY IF EXISTS "chat_memberships_insert" ON chat_memberships;
DROP POLICY IF EXISTS "chat_memberships_delete" ON chat_memberships;

DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups
CREATE POLICY "groups_select" ON groups FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "groups_insert" ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Group memberships
CREATE POLICY "memberships_select" ON group_memberships FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "memberships_insert" ON group_memberships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "memberships_delete" ON group_memberships FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Notices
CREATE POLICY "notices_select" ON notices FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');
CREATE POLICY "notices_insert" ON notices FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );
CREATE POLICY "notices_update" ON notices FOR UPDATE
  USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notice reads
CREATE POLICY "notice_reads_select" ON notice_reads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notice_reads_insert" ON notice_reads FOR INSERT WITH CHECK (user_id = auth.uid());

-- Blog posts
CREATE POLICY "blog_select" ON blog_posts FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');
CREATE POLICY "blog_insert" ON blog_posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Info pages
CREATE POLICY "info_select" ON info_pages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "info_insert" ON info_pages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "info_update" ON info_pages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chats
CREATE POLICY "chats_select" ON chats FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "chats_insert" ON chats FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent') OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Chat memberships
CREATE POLICY "chat_memberships_select" ON chat_memberships FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "chat_memberships_insert" ON chat_memberships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "chat_memberships_delete" ON chat_memberships FOR DELETE USING (user_id = auth.uid());

-- Messages
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_memberships
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_memberships
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

-- ─── Realtime ────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notices;
  END IF;
END $$;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notice_reads_user ON notice_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_memberships_user ON chat_memberships(user_id);

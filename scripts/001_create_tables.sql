-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create rooms table (couples can join/create rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_joined" ON public.rooms FOR SELECT USING (
  id IN (SELECT room_id FROM public.room_members WHERE user_id = auth.uid())
);
CREATE POLICY "rooms_insert_own" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "rooms_update_own" ON public.rooms FOR UPDATE USING (auth.uid() = created_by);

-- Create room_members junction table
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_members_select_own" ON public.room_members FOR SELECT USING (auth.uid() = user_id OR room_id IN (SELECT id FROM public.rooms WHERE created_by = auth.uid()));
CREATE POLICY "room_members_insert" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "room_members_delete_own" ON public.room_members FOR DELETE USING (auth.uid() = user_id);

-- Create presence table (real-time status)
CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presence_select_room_members" ON public.presence FOR SELECT USING (
  room_id IN (SELECT room_id FROM public.room_members WHERE user_id = auth.uid())
);
CREATE POLICY "presence_insert_own" ON public.presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "presence_update_own" ON public.presence FOR UPDATE USING (auth.uid() = user_id);

-- Create memories table (memory notes with emotions)
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion TEXT CHECK (emotion IN ('happy', 'excited', 'grateful', 'loved', 'peaceful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revealed_at TIMESTAMPTZ
);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memories_select_room" ON public.memories FOR SELECT USING (
  room_id IN (SELECT room_id FROM public.room_members WHERE user_id = auth.uid())
);
CREATE POLICY "memories_insert_own" ON public.memories FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "memories_update_own" ON public.memories FOR UPDATE USING (auth.uid() = created_by);

-- Create nudges table (presence/nudge animations)
CREATE TABLE IF NOT EXISTS public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nudges_select_own" ON public.nudges FOR SELECT USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);
CREATE POLICY "nudges_insert_own" ON public.nudges FOR INSERT WITH CHECK (auth.uid() = from_user_id);

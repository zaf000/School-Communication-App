export type UserRole = 'parent' | 'teacher' | 'admin';
export type GroupType = 'class' | 'year' | 'activity' | 'parent-community';
export type AudienceType = 'school-wide' | 'group';
export type NoticeStatus = 'draft' | 'published' | 'archived';
export type BlogCategory = 'school-life' | 'principal-update' | 'events' | 'achievements' | 'general';
export type InfoCategory = 'general' | 'contact' | 'schedules' | 'policies' | 'facilities' | 'links';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  expo_push_token: string | null;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  school_notices: boolean;
  teacher_updates: boolean;
  community_chat: boolean;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  description: string | null;
  created_by: string | null;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface GroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  role_in_group: 'member' | 'owner' | 'moderator';
  created_at: string;
  group?: Group;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  author_id: string;
  author_role: 'admin' | 'teacher';
  audience_type: AudienceType;
  audience_ids: string[];
  is_pinned: boolean;
  is_urgent: boolean;
  status: NoticeStatus;
  created_at: string;
  updated_at: string;
  author?: Profile;
  is_read?: boolean;
}

export interface NoticeRead {
  id: string;
  user_id: string;
  notice_id: string;
  read_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  body: string;
  cover_image_url: string | null;
  category: BlogCategory;
  published_at: string;
  author_id: string;
  status: 'draft' | 'published';
  created_at: string;
  author?: Profile;
}

export interface InfoPage {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: InfoCategory;
  updated_at: string;
  created_at: string;
}

export interface Chat {
  id: string;
  name: string;
  description: string | null;
  group_id: string | null;
  created_by: string;
  created_at: string;
  creator?: Profile;
  last_message?: Message;
  member_count?: number;
  is_member?: boolean;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: Profile;
}

export interface ChatMembership {
  id: string;
  chat_id: string;
  user_id: string;
  role_in_chat: 'member' | 'owner';
  joined_at: string;
}

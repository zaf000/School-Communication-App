import { supabase } from './supabase';
import { Notice, BlogPost, InfoPage, Chat, Message, Group, Profile } from '@/types';

// ─── Notices ─────────────────────────────────────────────────────────────────

export async function fetchNotices(userId: string, userGroupIds: string[]) {
  const { data, error } = await supabase
    .from('notices')
    .select('*, author:profiles(id,name,role,avatar_url)')
    .eq('status', 'published')
    .or(`audience_type.eq.school-wide,audience_ids.cs.{${userGroupIds.join(',')}}`)
    .order('is_pinned', { ascending: false })
    .order('is_urgent', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  const reads = await supabase
    .from('notice_reads')
    .select('notice_id')
    .eq('user_id', userId);

  const readIds = new Set((reads.data ?? []).map((r) => r.notice_id));
  return (data ?? []).map((n) => ({ ...n, is_read: readIds.has(n.id) })) as Notice[];
}

export async function fetchNotice(id: string, userId: string): Promise<Notice | null> {
  const { data, error } = await supabase
    .from('notices')
    .select('*, author:profiles(id,name,role,avatar_url)')
    .eq('id', id)
    .single();

  if (error) return null;

  const read = await supabase
    .from('notice_reads')
    .select('id')
    .eq('notice_id', id)
    .eq('user_id', userId)
    .maybeSingle();

  return { ...data, is_read: !!read.data } as Notice;
}

export async function markNoticeRead(noticeId: string, userId: string) {
  await supabase
    .from('notice_reads')
    .upsert({ notice_id: noticeId, user_id: userId }, { onConflict: 'user_id,notice_id' });
}

export async function createNotice(notice: Partial<Notice>) {
  const { data, error } = await supabase.from('notices').insert(notice).select().single();
  if (error) throw error;
  return data as Notice;
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(id,name,role,avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function fetchBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(id,name,role,avatar_url)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function createBlogPost(post: Partial<BlogPost>) {
  const { data, error } = await supabase.from('blog_posts').insert(post).select().single();
  if (error) throw error;
  return data as BlogPost;
}

// ─── Info Pages ──────────────────────────────────────────────────────────────

export async function fetchInfoPages(): Promise<InfoPage[]> {
  const { data, error } = await supabase
    .from('info_pages')
    .select('*')
    .order('category')
    .order('title');

  if (error) throw error;
  return (data ?? []) as InfoPage[];
}

export async function fetchInfoPage(slug: string): Promise<InfoPage | null> {
  const { data, error } = await supabase
    .from('info_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as InfoPage;
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export async function fetchUserGroups(userId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group_memberships')
    .select('group:groups(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((m) => (m as any).group).filter(Boolean) as Group[];
}

export async function fetchAllGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .neq('type', 'parent-community')
    .order('type')
    .order('name');

  if (error) throw error;
  return (data ?? []) as Group[];
}

// ─── Chats ───────────────────────────────────────────────────────────────────

export async function fetchChats(userId: string): Promise<Chat[]> {
  const { data: memberships } = await supabase
    .from('chat_memberships')
    .select('chat_id')
    .eq('user_id', userId);

  const chatIds = (memberships ?? []).map((m) => m.chat_id);

  const { data, error } = await supabase
    .from('chats')
    .select('*, creator:profiles(id,name,avatar_url)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const memberCounts = await Promise.all(
    (data ?? []).map((c) =>
      supabase.from('chat_memberships').select('id', { count: 'exact', head: true }).eq('chat_id', c.id)
    )
  );

  return (data ?? []).map((c, i) => ({
    ...c,
    is_member: chatIds.includes(c.id),
    member_count: memberCounts[i].count ?? 0,
  })) as Chat[];
}

export async function fetchChatMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(id,name,avatar_url)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(chatId: string, senderId: string, body: string) {
  const { error } = await supabase.from('messages').insert({ chat_id: chatId, sender_id: senderId, body });
  if (error) throw error;
}

export async function createChat(name: string, description: string, createdBy: string): Promise<Chat> {
  const { data, error } = await supabase
    .from('chats')
    .insert({ name, description, created_by: createdBy })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('chat_memberships').insert({
    chat_id: data.id,
    user_id: createdBy,
    role_in_chat: 'owner',
  });

  return data as Chat;
}

export async function joinChat(chatId: string, userId: string) {
  await supabase.from('chat_memberships').upsert(
    { chat_id: chatId, user_id: userId, role_in_chat: 'member' },
    { onConflict: 'chat_id,user_id' }
  );
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
}

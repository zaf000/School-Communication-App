import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Notice {
  id: string;
  title: string;
  body: string;
  audience_type: 'school-wide' | 'group';
  audience_ids: string[];
  is_urgent: boolean;
  status: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Notice;
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  // Only send notifications for newly published notices
  if (payload.type !== 'INSERT' || payload.record.status !== 'published') {
    return new Response(JSON.stringify({ message: 'Skipped' }), { status: 200 });
  }

  const notice = payload.record;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Fetch push tokens — filter by group membership if group-targeted
  let tokenQuery = supabase
    .from('profiles')
    .select('expo_push_token')
    .not('expo_push_token', 'is', null);

  if (notice.audience_type === 'group' && notice.audience_ids.length > 0) {
    const { data: members } = await supabase
      .from('group_memberships')
      .select('user_id')
      .in('group_id', notice.audience_ids);

    const userIds = (members ?? []).map((m) => m.user_id);
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No members in group' }), { status: 200 });
    }
    tokenQuery = tokenQuery.in('id', userIds);
  }

  const { data: profiles } = await tokenQuery;
  const tokens = (profiles ?? []).map((p) => p.expo_push_token).filter(Boolean);

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ message: 'No push tokens registered' }), { status: 200 });
  }

  // Build Expo push messages
  const messages = tokens.map((token) => ({
    to: token,
    title: notice.is_urgent ? `🚨 ${notice.title}` : notice.title,
    body: notice.body.length > 100 ? notice.body.slice(0, 97) + '…' : notice.body,
    data: { noticeId: notice.id },
    sound: 'default',
    priority: notice.is_urgent ? 'high' : 'normal',
  }));

  // Expo Push API accepts max 100 messages per request
  const chunks: typeof messages[] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      }).then((r) => r.json())
    )
  );

  return new Response(
    JSON.stringify({ sent: tokens.length, results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});

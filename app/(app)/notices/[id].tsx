import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { fetchNotice, markNoticeRead } from '@/lib/database';
import { Notice } from '@/types';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/lib/utils';

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !profile) return;
    fetchNotice(id, profile.id).then((data) => {
      setNotice(data);
      setLoading(false);
      if (data && !data.is_read) {
        markNoticeRead(id, profile.id);
      }
    });
  }, [id, profile]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!notice) return (
    <View style={styles.error}>
      <Text style={styles.errorText}>Notice not found.</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Go back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Urgent banner */}
      {notice.is_urgent && (
        <View style={styles.urgentBanner}>
          <Text style={styles.urgentText}>🚨 Urgent Notice</Text>
        </View>
      )}

      {/* Badges */}
      <View style={styles.badges}>
        {notice.is_pinned && <Badge label="Pinned" size="md" />}
        <Badge
          label={notice.audience_type === 'school-wide' ? 'School-Wide' : 'Group'}
          color={Colors.textSecondary}
          bg={Colors.border}
          size="md"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>{notice.title}</Text>

      {/* Author */}
      <View style={styles.meta}>
        <Avatar
          name={notice.author?.name ?? 'School'}
          avatarUrl={notice.author?.avatar_url}
          role={notice.author?.role}
          size={36}
        />
        <View style={styles.metaText}>
          <Text style={styles.authorName}>{notice.author?.name ?? 'School Administration'}</Text>
          <Text style={styles.authorRole}>{notice.author?.role ?? 'admin'}</Text>
        </View>
        <Text style={styles.date}>{formatDate(notice.created_at)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Body */}
      <Text style={styles.body}>{notice.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 20, gap: 16 },
  urgentBanner: {
    backgroundColor: Colors.urgentBg,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.urgent,
  },
  urgentText: { fontSize: 14, fontWeight: '700', color: Colors.urgent },
  badges: { flexDirection: 'row', gap: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, lineHeight: 32 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  metaText: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  authorRole: { fontSize: 12, color: Colors.textSecondary, textTransform: 'capitalize' },
  date: { fontSize: 12, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border },
  body: { fontSize: 16, color: Colors.text, lineHeight: 26 },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 18, color: Colors.text },
  back: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
});

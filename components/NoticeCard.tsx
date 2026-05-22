import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Notice } from '@/types';
import { Colors } from '@/constants/Colors';
import { Badge } from './Badge';
import { formatDistanceToNow } from '@/lib/utils';

interface NoticeCardProps {
  notice: Notice;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const isUnread = !notice.is_read;

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.unread, notice.is_pinned && styles.pinned]}
      onPress={() => router.push(`/notices/${notice.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.badges}>
          {notice.is_urgent && (
            <Badge label="URGENT" color={Colors.urgent} bg={Colors.urgentBg} />
          )}
          {notice.is_pinned && (
            <Badge label="PINNED" color={Colors.primary} bg={Colors.primaryMuted} />
          )}
          {notice.audience_type === 'school-wide' && (
            <Badge label="School-Wide" color={Colors.textSecondary} bg={Colors.border} />
          )}
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </View>

      <Text style={styles.title} numberOfLines={2}>{notice.title}</Text>
      <Text style={styles.body} numberOfLines={2}>{notice.body}</Text>

      <View style={styles.footer}>
        <Text style={styles.author}>
          {notice.author?.name ?? 'School'}
        </Text>
        <Text style={styles.time}>{formatDistanceToNow(notice.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unread: {
    backgroundColor: Colors.unreadBg,
    borderColor: Colors.primaryLight,
  },
  pinned: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.unreadDot,
    marginLeft: 8,
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  author: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

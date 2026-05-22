import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/AuthContext';
import { fetchNotices, fetchBlogPosts, fetchUserGroups } from '@/lib/database';
import { Notice, BlogPost, Group } from '@/types';
import { Colors } from '@/constants/Colors';
import { NoticeCard } from '@/components/NoticeCard';
import { BlogPostCard } from '@/components/BlogPostCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile) return;
    try {
      const userGroups = await fetchUserGroups(profile.id);
      setGroups(userGroups);
      const groupIds = userGroups.map((g) => g.id);
      const [n, p] = await Promise.all([
        fetchNotices(profile.id, groupIds),
        fetchBlogPosts(),
      ]);
      setNotices(n.slice(0, 5));
      setPosts(p.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const unreadCount = notices.filter((n) => !n.is_read).length;
  const urgentNotices = notices.filter((n) => n.is_urgent && !n.is_read);

  if (loading) return <LoadingSpinner fullScreen />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{profile?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(app)/settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={styles.unreadText}>
              {unreadCount} unread notice{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Urgent Notices */}
      {urgentNotices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.urgentHeader}>
            <Text style={styles.urgentIcon}>🚨</Text>
            <Text style={styles.urgentTitle}>Urgent Notices</Text>
          </View>
          {urgentNotices.map((n) => <NoticeCard key={n.id} notice={n} />)}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction emoji="📋" label="Notices" onPress={() => router.push('/(app)/(tabs)/notices')} />
        <QuickAction emoji="📰" label="Blog" onPress={() => router.push('/(app)/(tabs)/blog')} />
        <QuickAction emoji="💬" label="Chat" onPress={() => router.push('/(app)/(tabs)/chat')} />
        <QuickAction emoji="ℹ️" label="Info" onPress={() => router.push('/(app)/(tabs)/info')} />
      </View>

      {/* Recent Notices */}
      <View style={styles.section}>
        <SectionHeader title="Recent Notices" onMore={() => router.push('/(app)/(tabs)/notices')} />
        {notices.length === 0 ? (
          <Text style={styles.emptyText}>No notices yet.</Text>
        ) : (
          notices.slice(0, 3).map((n) => <NoticeCard key={n.id} notice={n} />)
        )}
      </View>

      {/* Latest Blog Posts */}
      {posts.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="From the School" onMore={() => router.push('/(app)/(tabs)/blog')} />
          {posts.map((p) => <BlogPostCard key={p.id} post={p} compact />)}
        </View>
      )}

      {/* My Groups */}
      {groups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupsRow}>
            {groups.map((g) => (
              <View key={g.id} style={styles.groupChip}>
                <Text style={styles.groupChipText}>{g.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

function QuickAction({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.quickActionEmoji}>{emoji}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onMore }: { title: string; onMore: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onMore}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { gap: 0 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: { gap: 2 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: 26, fontWeight: '800', color: '#fff' },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 24 },
  unreadBanner: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  unreadText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  section: { padding: 16, gap: 12 },
  urgentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgentIcon: { fontSize: 20 },
  urgentTitle: { fontSize: 17, fontWeight: '700', color: Colors.urgent },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: 12 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickAction: {
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionEmoji: { fontSize: 26 },
  quickActionLabel: { fontSize: 11, color: Colors.text, fontWeight: '600' },
  groupsRow: { gap: 8, paddingVertical: 4 },
  groupChip: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  groupChipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  bottomPad: { height: 32 },
});

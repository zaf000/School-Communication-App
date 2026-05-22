import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { fetchNotices, fetchUserGroups } from '@/lib/database';
import { Notice } from '@/types';
import { Colors } from '@/constants/Colors';
import { NoticeCard } from '@/components/NoticeCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

type Filter = 'all' | 'unread' | 'urgent' | 'pinned';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'pinned', label: 'Pinned' },
];

export default function NoticesScreen() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotices = useCallback(async () => {
    if (!profile) return;
    try {
      const groups = await fetchUserGroups(profile.id);
      const groupIds = groups.map((g) => g.id);
      const data = await fetchNotices(profile.id, groupIds);
      setNotices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => { loadNotices(); }, [loadNotices]);
  const onRefresh = () => { setRefreshing(true); loadNotices(); };

  const filtered = notices.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'urgent') return n.is_urgent;
    if (filter === 'pinned') return n.is_pinned;
    return true;
  });

  const canCreate = profile?.role === 'admin' || profile?.role === 'teacher';

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notice Board</Text>
        {canCreate && (
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(app)/create-notice')}>
            <Text style={styles.createBtnText}>+ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const count = f.key === 'unread' ? notices.filter((n) => !n.is_read).length : undefined;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filter, filter === f.key && styles.filterActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}{count ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <NoticeCard notice={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No notices"
            description={filter !== 'all' ? 'Try a different filter.' : 'Check back soon for school notices.'}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  createBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filter: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  separator: { height: 0 },
});

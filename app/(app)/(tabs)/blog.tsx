import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { fetchBlogPosts } from '@/lib/database';
import { BlogPost, BlogCategory } from '@/types';
import { Colors } from '@/constants/Colors';
import { BlogPostCard } from '@/components/BlogPostCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { blogCategoryLabel } from '@/lib/utils';

const CATEGORIES: { key: BlogCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'school-life', label: 'School Life' },
  { key: 'principal-update', label: "Principal's" },
  { key: 'events', label: 'Events' },
  { key: 'achievements', label: 'Achievements' },
];

export default function BlogScreen() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState<BlogCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchBlogPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadPosts(); }, [loadPosts]));
  const onRefresh = () => { setRefreshing(true); loadPosts(); };

  const filtered = category === 'all' ? posts : posts.filter((p) => p.category === category);
  const isAdmin = profile?.role === 'admin';

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Blog</Text>
        {isAdmin && (
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(app)/create-post')}>
            <Text style={styles.createBtnText}>+ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categories}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.cat, category === c.key && styles.catActive]}
            onPress={() => setCategory(c.key)}
          >
            <Text style={[styles.catText, category === c.key && styles.catTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <BlogPostCard post={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="📰"
            title="No posts yet"
            description="Check back for school news and updates."
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
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexWrap: 'wrap',
  },
  cat: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, flexGrow: 1 },
});

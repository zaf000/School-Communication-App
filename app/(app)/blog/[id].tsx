import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchBlogPost } from '@/lib/database';
import { BlogPost } from '@/types';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { formatDate, blogCategoryLabel, blogCategoryColor } from '@/lib/utils';

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchBlogPost(id).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return (
    <View style={styles.error}>
      <Text style={styles.errorText}>Post not found.</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Go back</Text>
      </TouchableOpacity>
    </View>
  );

  const { color, bg } = blogCategoryColor(post.category);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {post.cover_image_url && (
        <Image source={{ uri: post.cover_image_url }} style={styles.cover} contentFit="cover" />
      )}
      <View style={styles.body}>
        <Badge label={blogCategoryLabel(post.category)} color={color} bg={bg} size="md" />
        <Text style={styles.title}>{post.title}</Text>
        <View style={styles.meta}>
          <Avatar
            name={post.author?.name ?? 'School'}
            avatarUrl={post.author?.avatar_url}
            role={post.author?.role}
            size={36}
          />
          <View style={styles.metaText}>
            <Text style={styles.authorName}>{post.author?.name ?? 'School'}</Text>
            <Text style={styles.date}>{formatDate(post.published_at)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.bodyText}>{post.body}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingBottom: 40 },
  cover: { width: '100%', height: 220, backgroundColor: Colors.border },
  body: { padding: 20, gap: 14 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, lineHeight: 34 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaText: { gap: 2 },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  date: { fontSize: 12, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border },
  bodyText: { fontSize: 16, color: Colors.text, lineHeight: 26 },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 18, color: Colors.text },
  back: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
});

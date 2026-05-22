import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BlogPost } from '@/types';
import { Colors } from '@/constants/Colors';
import { formatDistanceToNow, blogCategoryLabel, blogCategoryColor } from '@/lib/utils';
import { Badge } from './Badge';

interface BlogPostCardProps {
  post: BlogPost;
  compact?: boolean;
}

export function BlogPostCard({ post, compact = false }: BlogPostCardProps) {
  const { color, bg } = blogCategoryColor(post.category);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compact]}
      onPress={() => router.push(`/blog/${post.id}` as any)}
      activeOpacity={0.7}
    >
      {post.cover_image_url && !compact && (
        <Image
          source={{ uri: post.cover_image_url }}
          style={styles.cover}
          contentFit="cover"
        />
      )}
      <View style={styles.content}>
        <Badge label={blogCategoryLabel(post.category)} color={color} bg={bg} />
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
          {post.title}
        </Text>
        {!compact && (
          <Text style={styles.body} numberOfLines={3}>{post.body}</Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.author}>{post.author?.name ?? 'School'}</Text>
          <Text style={styles.time}>{formatDistanceToNow(post.published_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compact: {
    flexDirection: 'row',
  },
  cover: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.border,
  },
  content: {
    padding: 14,
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  titleCompact: {
    fontSize: 14,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchInfoPage } from '@/lib/database';
import { InfoPage } from '@/types';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { infoCategoryLabel, infoCategoryIcon } from '@/lib/utils';

export default function InfoDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState<InfoPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchInfoPage(slug).then((data) => {
      setPage(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!page) return (
    <View style={styles.error}>
      <Text style={styles.errorText}>Page not found.</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Go back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.categoryRow}>
        <Text style={styles.categoryIcon}>{infoCategoryIcon(page.category)}</Text>
        <Text style={styles.categoryLabel}>{infoCategoryLabel(page.category)}</Text>
      </View>
      <Text style={styles.title}>{page.title}</Text>
      <View style={styles.divider} />
      <Text style={styles.body}>{page.body}</Text>
      <Text style={styles.updated}>
        Last updated {new Date(page.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 20, gap: 14 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryIcon: { fontSize: 20 },
  categoryLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, lineHeight: 34 },
  divider: { height: 1, backgroundColor: Colors.border },
  body: { fontSize: 16, color: Colors.text, lineHeight: 26 },
  updated: { fontSize: 12, color: Colors.textMuted, marginTop: 16 },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 18, color: Colors.text },
  back: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
});

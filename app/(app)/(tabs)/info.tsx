import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { fetchInfoPages } from '@/lib/database';
import { InfoPage, InfoCategory } from '@/types';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { infoCategoryLabel, infoCategoryIcon } from '@/lib/utils';

interface Section {
  title: string;
  icon: string;
  data: InfoPage[];
}

export default function InfoScreen() {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPages = useCallback(async () => {
    try {
      const data = await fetchInfoPages();
      setPages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);
  const onRefresh = () => { setRefreshing(true); loadPages(); };

  const sections: Section[] = (() => {
    const cats = [...new Set(pages.map((p) => p.category))] as InfoCategory[];
    return cats.map((cat) => ({
      title: infoCategoryLabel(cat),
      icon: infoCategoryIcon(cat),
      data: pages.filter((p) => p.category === cat),
    }));
  })();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Important Information</Text>
        <Text style={styles.headerSub}>Essential school resources</Text>
      </View>

      {pages.length === 0 ? (
        <EmptyState
          icon="ℹ️"
          title="No information pages yet"
          description="The school hasn't added any info pages yet."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push(`/(app)/info/${item.slug}` as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemArrow}>›</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderSectionFooter={() => <View style={styles.sectionGap} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  list: { padding: 16, gap: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingTop: 4,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  item: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 15, color: Colors.text, fontWeight: '500', flex: 1 },
  itemArrow: { fontSize: 20, color: Colors.textMuted, marginLeft: 8 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 16 },
  sectionGap: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { fetchChats, joinChat } from '@/lib/database';
import { Chat } from '@/types';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatDistanceToNow } from '@/lib/utils';

export default function ChatScreen() {
  const { profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await fetchChats(profile.id);
      setChats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => { loadChats(); }, [loadChats]);
  const onRefresh = () => { setRefreshing(true); loadChats(); };

  const handleJoin = async (chat: Chat) => {
    if (!profile) return;
    Alert.alert('Join Chat', `Join "${chat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Join',
        onPress: async () => {
          await joinChat(chat.id, profile.id);
          loadChats();
        },
      },
    ]);
  };

  const myChats = chats.filter((c) => c.is_member);
  const otherChats = chats.filter((c) => !c.is_member);

  const isParent = profile?.role === 'parent';

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Chat</Text>
          <Text style={styles.headerSub}>Parent-managed groups</Text>
        </View>
        {isParent && (
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(app)/chat/create')}>
            <Text style={styles.createBtnText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          💬 Community chats are parent-managed and not official school communication.
        </Text>
      </View>

      <FlatList
        data={[...myChats, ...otherChats]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListHeaderComponent={
          myChats.length > 0 ? (
            <Text style={styles.sectionLabel}>My Groups</Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <>
            {index === myChats.length && otherChats.length > 0 && (
              <Text style={styles.sectionLabel}>Discover Groups</Text>
            )}
            <ChatCard
              chat={item}
              isMember={item.is_member ?? false}
              onPress={() => {
                if (item.is_member) {
                  router.push(`/(app)/chat/${item.id}` as any);
                } else {
                  handleJoin(item);
                }
              }}
            />
          </>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title="No chat groups yet"
            description="Create a community chat group to connect with other parents."
          />
        }
      />
    </View>
  );
}

function ChatCard({ chat, isMember, onPress }: { chat: Chat; isMember: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.card, !isMember && styles.cardDim]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{chat.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{chat.name}</Text>
          <Text style={styles.cardTime}>{formatDistanceToNow(chat.created_at)}</Text>
        </View>
        <Text style={styles.cardDesc} numberOfLines={1}>
          {chat.description ?? `${chat.member_count ?? 0} member${(chat.member_count ?? 0) !== 1 ? 's' : ''}`}
        </Text>
      </View>
      {!isMember && (
        <View style={styles.joinBadge}>
          <Text style={styles.joinBadgeText}>Join</Text>
        </View>
      )}
    </TouchableOpacity>
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
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  createBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  disclaimer: {
    backgroundColor: Colors.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 12,
    paddingHorizontal: 16,
  },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  list: { flexGrow: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 72 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  cardDim: { opacity: 0.8 },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardAvatarText: { fontSize: 20, color: Colors.primary, fontWeight: '700' },
  cardContent: { flex: 1, gap: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  cardTime: { fontSize: 11, color: Colors.textMuted },
  cardDesc: { fontSize: 13, color: Colors.textSecondary },
  joinBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

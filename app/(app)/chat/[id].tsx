import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { fetchChatMessages, sendMessage } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types';
import { Colors } from '@/constants/Colors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Avatar } from '@/components/Avatar';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const data = await fetchChatMessages(id);
    setMessages(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`chat:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${id}` },
        async () => { await loadMessages(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, loadMessages]);

  const handleSend = async () => {
    if (!text.trim() || !profile || !id || sending) return;
    const body = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(id, profile.id, body);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>Parent community group — not official school communication</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isMe = item.sender_id === profile?.id;
          const prevMsg = messages[index - 1];
          const showAvatar = !isMe && prevMsg?.sender_id !== item.sender_id;
          return <MessageBubble message={item} isMe={isMe} showAvatar={showAvatar} />;
        }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet. Say hello! 👋</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, isMe, showAvatar }: { message: Message; isMe: boolean; showAvatar: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
      {!isMe && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <Avatar name={message.sender?.name ?? '?'} avatarUrl={message.sender?.avatar_url} size={28} />
          ) : (
            <View style={{ width: 28 }} />
          )}
        </View>
      )}
      <View style={[styles.bubbleContent, isMe ? styles.bubbleContentMe : styles.bubbleContentThem]}>
        {!isMe && showAvatar && (
          <Text style={styles.senderName}>{message.sender?.name ?? 'Parent'}</Text>
        )}
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{message.body}</Text>
        <Text style={[styles.timeText, isMe && styles.timeTextMe]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  disclaimer: {
    backgroundColor: Colors.warningBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  disclaimerText: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  list: { padding: 12, gap: 4, flexGrow: 1 },
  bubble: { flexDirection: 'row', marginVertical: 2, alignItems: 'flex-end' },
  bubbleMe: { justifyContent: 'flex-end' },
  bubbleThem: { justifyContent: 'flex-start' },
  avatarSlot: { width: 32, marginRight: 6, alignSelf: 'flex-end' },
  bubbleContent: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 10,
    paddingHorizontal: 14,
    gap: 2,
  },
  bubbleContentMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleContentThem: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  senderName: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  messageText: { fontSize: 15, color: Colors.text, lineHeight: 21 },
  messageTextMe: { color: '#fff' },
  timeText: { fontSize: 10, color: Colors.textMuted, alignSelf: 'flex-end' },
  timeTextMe: { color: 'rgba(255,255,255,0.7)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { fontSize: 18, color: '#fff' },
});

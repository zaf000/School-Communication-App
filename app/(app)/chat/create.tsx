import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { createChat } from '@/lib/database';
import { Colors } from '@/constants/Colors';

export default function CreateChatScreen() {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a group name.');
      return;
    }
    if (!profile) return;

    setLoading(true);
    try {
      const chat = await createChat(name.trim(), description.trim(), profile.id);
      router.replace(`/(app)/chat/${chat.id}` as any);
    } catch (e) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.emoji}>💬</Text>
          <Text style={styles.title}>Create a Chat Group</Text>
          <Text style={styles.subtitle}>
            Community chat groups are parent-managed spaces. They are separate from official school communication.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Group name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Year 3 Parents, Swimming Carnival"
              placeholderTextColor={Colors.textMuted}
              maxLength={60}
            />
            <Text style={styles.hint}>{name.length}/60</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What is this group for?"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.hint}>{description.length}/200</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ By creating this group, you acknowledge it is a parent community space and not affiliated with or monitored by the school.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!name.trim() || loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating…' : 'Create Group'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, gap: 24 },
  intro: { alignItems: 'center', gap: 8, paddingTop: 12 },
  emoji: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  disclaimer: {
    backgroundColor: Colors.warningBg,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  disclaimerText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 15, color: Colors.textSecondary },
});

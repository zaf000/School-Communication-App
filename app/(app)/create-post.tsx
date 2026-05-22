import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { createBlogPost } from '@/lib/database';
import { BlogCategory } from '@/types';
import { Colors } from '@/constants/Colors';
import { blogCategoryLabel } from '@/lib/utils';

const CATEGORIES: BlogCategory[] = ['school-life', 'principal-update', 'events', 'achievements', 'general'];

export default function CreatePostScreen() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState<BlogCategory>('school-life');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async () => {
    setErrorMsg('');
    if (!title.trim() || !body.trim()) {
      setErrorMsg('Please enter a title and body.');
      return;
    }
    if (!profile) return;

    setLoading(true);
    try {
      await createBlogPost({
        title: title.trim(),
        body: body.trim(),
        cover_image_url: coverUrl.trim() || undefined,
        category,
        author_id: profile.id,
        status: 'published',
        published_at: new Date().toISOString(),
      });
      router.back();
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Post title"
            placeholderTextColor={Colors.textMuted}
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.cat, category === c && styles.catActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.catText, category === c && styles.catTextActive]}>
                  {blogCategoryLabel(c)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cover image URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={coverUrl}
            onChangeText={setCoverUrl}
            placeholder="https://..."
            placeholderTextColor={Colors.textMuted}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={body}
            onChangeText={setBody}
            placeholder="Write the post content…"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, (!title.trim() || !body.trim() || loading) && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || !body.trim() || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Publishing…' : 'Publish Post'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 18 },
  field: { gap: 8 },
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
  textarea: { minHeight: 160, textAlignVertical: 'top' },
  cats: { gap: 8 },
  cat: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  catActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel: { alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 15, color: Colors.textSecondary },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },
});

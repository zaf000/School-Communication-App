import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { createNotice, fetchAllGroups } from '@/lib/database';
import { Group } from '@/types';
import { Colors } from '@/constants/Colors';

export default function CreateNoticeScreen() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [audienceType, setAudienceType] = useState<'school-wide' | 'group'>('school-wide');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';

  useEffect(() => {
    if (isTeacher) {
      setAudienceType('group');
    }
    fetchAllGroups().then(setGroups);
  }, [isTeacher]);

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing fields', 'Please enter a title and body.');
      return;
    }
    if (audienceType === 'group' && selectedGroups.length === 0) {
      Alert.alert('Select audience', 'Please select at least one group.');
      return;
    }
    if (!profile) return;

    setLoading(true);
    try {
      await createNotice({
        title: title.trim(),
        body: body.trim(),
        author_id: profile.id,
        author_role: profile.role as 'admin' | 'teacher',
        audience_type: isTeacher ? 'group' : audienceType,
        audience_ids: audienceType === 'group' ? selectedGroups : [],
        is_urgent: isAdmin ? isUrgent : false,
        is_pinned: isAdmin ? isPinned : false,
        status: 'published',
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to create notice. Please try again.');
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
            placeholder="Notice title"
            placeholderTextColor={Colors.textMuted}
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Body *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={body}
            onChangeText={setBody}
            placeholder="Write the notice content…"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Audience — admin can choose school-wide or group; teacher always group */}
        {isAdmin && (
          <View style={styles.field}>
            <Text style={styles.label}>Audience</Text>
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[styles.seg, audienceType === 'school-wide' && styles.segActive]}
                onPress={() => setAudienceType('school-wide')}
              >
                <Text style={[styles.segText, audienceType === 'school-wide' && styles.segTextActive]}>School-Wide</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.seg, audienceType === 'group' && styles.segActive]}
                onPress={() => setAudienceType('group')}
              >
                <Text style={[styles.segText, audienceType === 'group' && styles.segTextActive]}>Specific Groups</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Group selection */}
        {(audienceType === 'group' || isTeacher) && (
          <View style={styles.field}>
            <Text style={styles.label}>Select Groups *</Text>
            <View style={styles.groupList}>
              {groups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.groupOption, selectedGroups.includes(g.id) && styles.groupOptionSelected]}
                  onPress={() => toggleGroup(g.id)}
                >
                  <Text style={[styles.groupOptionText, selectedGroups.includes(g.id) && styles.groupOptionTextSelected]}>
                    {g.name}
                  </Text>
                  <Text style={styles.groupType}>{g.type}</Text>
                </TouchableOpacity>
              ))}
              {groups.length === 0 && (
                <Text style={styles.noGroups}>No groups found. An admin needs to create groups first.</Text>
              )}
            </View>
          </View>
        )}

        {/* Admin-only options */}
        {isAdmin && (
          <View style={styles.toggleGroup}>
            <View style={styles.toggle}>
              <View>
                <Text style={styles.toggleLabel}>Urgent notice</Text>
                <Text style={styles.toggleDesc}>Triggers strong push notification</Text>
              </View>
              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                trackColor={{ true: Colors.urgent, false: Colors.border }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.toggle}>
              <View>
                <Text style={styles.toggleLabel}>Pin notice</Text>
                <Text style={styles.toggleDesc}>Keeps it at the top</Text>
              </View>
              <Switch
                value={isPinned}
                onValueChange={setIsPinned}
                trackColor={{ true: Colors.primary, false: Colors.border }}
                thumbColor="#fff"
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, (!title.trim() || !body.trim() || loading) && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || !body.trim() || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Publishing…' : 'Publish Notice'}</Text>
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
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  seg: { flex: 1, padding: 12, alignItems: 'center' },
  segActive: { backgroundColor: Colors.primary },
  segText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  segTextActive: { color: '#fff' },
  groupList: { gap: 8 },
  groupOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  groupOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  groupOptionText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  groupOptionTextSelected: { color: Colors.primary, fontWeight: '700' },
  groupType: { fontSize: 11, color: Colors.textMuted, textTransform: 'capitalize' },
  noGroups: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 12 },
  toggleGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  toggleDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
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
});

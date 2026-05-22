import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Avatar } from '@/components/Avatar';
import { NotificationPreferences } from '@/types';

export default function SettingsScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    profile?.notification_preferences ?? {
      school_notices: true,
      teacher_updates: true,
      community_chat: false,
    }
  );
  const [saving, setSaving] = useState(false);

  const updatePref = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ notification_preferences: updated })
      .eq('id', profile?.id ?? '');
    await refreshProfile();
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const roleColor = () => {
    if (profile?.role === 'admin') return { color: Colors.roleAdmin, bg: Colors.roleAdminBg };
    if (profile?.role === 'teacher') return { color: Colors.roleTeacher, bg: Colors.roleTeacherBg };
    return { color: Colors.roleParent, bg: Colors.roleParentBg };
  };
  const { color, bg } = roleColor();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <Avatar name={profile?.name ?? ''} avatarUrl={profile?.avatar_url} role={profile?.role} size={64} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: bg }]}>
            <Text style={[styles.roleText, { color }]}>
              {profile?.role === 'admin' ? 'Administrator' : profile?.role === 'teacher' ? 'Teacher' : 'Parent'}
            </Text>
          </View>
        </View>
      </View>

      {/* Notification preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionDesc}>Choose which notifications you receive.</Text>

        <View style={styles.card}>
          <PrefToggle
            label="School Notices"
            desc="Official school-wide announcements"
            value={prefs.school_notices}
            onChange={(v) => updatePref('school_notices', v)}
          />
          <PrefToggle
            label="Teacher Updates"
            desc="Updates from your child's teachers"
            value={prefs.teacher_updates}
            onChange={(v) => updatePref('teacher_updates', v)}
          />
          <PrefToggle
            label="Community Chat"
            desc="Messages in parent chat groups"
            value={prefs.community_chat}
            onChange={(v) => updatePref('community_chat', v)}
            last
          />
        </View>
        {saving && <Text style={styles.saving}>Saving preferences…</Text>}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>App version</Text>
            <Text style={styles.infoValue}>1.0.0 MVP</Text>
          </View>
          <View style={[styles.infoRow, styles.last]}>
            <Text style={styles.infoKey}>School</Text>
            <Text style={styles.infoValue}>Single School MVP</Text>
          </View>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PrefToggle({ label, desc, value, onChange, last }: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.prefRow, !last && styles.prefRowBorder]}>
      <View style={styles.prefText}>
        <Text style={styles.prefLabel}>{label}</Text>
        <Text style={styles.prefDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Colors.primary, false: Colors.border }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  roleText: { fontSize: 12, fontWeight: '700' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionDesc: { fontSize: 13, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  prefRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  prefText: { flex: 1 },
  prefLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  prefDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  last: { borderBottomWidth: 0 },
  infoKey: { fontSize: 15, color: Colors.text },
  infoValue: { fontSize: 15, color: Colors.textSecondary },
  saving: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  signOutBtn: {
    backgroundColor: Colors.urgentBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.urgent + '30',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: Colors.urgent },
});

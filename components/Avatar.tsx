import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  role?: 'admin' | 'teacher' | 'parent';
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function roleColor(role?: string) {
  if (role === 'admin') return Colors.roleAdmin;
  if (role === 'teacher') return Colors.roleTeacher;
  return Colors.primary;
}

export function Avatar({ name, avatarUrl, size = 36, role }: AvatarProps) {
  const bg = roleColor(role);
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
      />
    );
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.border,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
});

import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { registerForPushNotifications } from '@/lib/notifications';
import { Colors } from '@/constants/Colors';

export default function AppLayout() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  useEffect(() => {
    if (session?.user?.id) {
      registerForPushNotifications(session.user.id);
    }
  }, [session?.user?.id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!session) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notices/[id]" options={{ title: 'Notice' }} />
      <Stack.Screen name="blog/[id]" options={{ title: 'Blog Post' }} />
      <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
      <Stack.Screen name="chat/create" options={{ title: 'New Chat Group', presentation: 'modal' }} />
      <Stack.Screen name="info/[slug]" options={{ title: 'Information' }} />
      <Stack.Screen name="create-notice" options={{ title: 'Create Notice', presentation: 'modal' }} />
      <Stack.Screen name="create-post" options={{ title: 'Create Post', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

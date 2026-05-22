import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? Colors.tabActive : Colors.tabInactive }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Notices" emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Blog" emoji="📰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Chat" emoji="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Info" emoji="ℹ️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopColor: Colors.tabBarBorder,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 52,
  },
  tabItemFocused: {
    backgroundColor: Colors.primaryMuted,
  },
  emoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});

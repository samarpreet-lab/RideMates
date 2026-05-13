import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sp, fs } from '@/constants/responsive';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Add extra padding for Android gesture navigation bar
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, sp(8)) : sp(8);
  const tabBarHeight = sp(56) + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#C24E00',
        tabBarInactiveTintColor: '#A8937F',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: sp(8),
          shadowOffset: { width: 0, height: -2 },
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: sp(4),
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-around',
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: sp(8),
        },
        tabBarLabelStyle: {
          fontSize: fs(11),
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: sp(-2),
        },
      }}
    >
      {/* Auth screens — tab bar hidden */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

      {/* Main app tabs */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post-ride"
        options={{
          title: 'Post Ride',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-rides"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions-car" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="ride-details"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

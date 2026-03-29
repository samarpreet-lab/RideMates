// =============================================================================
// components/Explore/BottomCommandSheet.tsx — Animated bottom sheet
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Router } from 'expo-router';
import { s } from './styles';
import { UserProfile, getGreeting } from './constants';

interface BottomCommandSheetProps {
  profile: UserProfile | null;
  trustScore: number;
  trustColor: string;
  sheetHeight: Animated.Value;
  sheetExpanded: boolean;
  toggleSheet: () => void;
  openSearchModal: () => void;
  handleLogout: () => void;
  router: Router;
  tabBarHeight: number;
}

export default function BottomCommandSheet({
  profile,
  trustScore,
  trustColor,
  sheetHeight,
  sheetExpanded,
  toggleSheet,
  openSearchModal,
  handleLogout,
  router,
  tabBarHeight,
}: BottomCommandSheetProps) {
  return (
    <Animated.View style={[s.commandSheet, { height: sheetHeight, bottom: 0 }]}>
      {/* Drag handle + greeting */}
      <TouchableOpacity
        style={s.sheetHandle}
        onPress={toggleSheet}
        activeOpacity={0.8}
      >
        <View style={s.handleBar} />
        <View style={s.greetingRow}>
          <View style={{ flex: 1, flexShrink: 1, marginRight: 8 }}>
            <Text style={s.greetingTitle} numberOfLines={1}>
              {getGreeting()}, {profile ? profile.full_name : 'there'}
            </Text>
            <Text style={s.greetingSubtitle} numberOfLines={1}>
              Where to, {profile ? profile.full_name : 'you'}?
            </Text>
          </View>
          <View
            style={[
              s.trustPill,
              { backgroundColor: trustColor + '22', borderColor: trustColor },
            ]}
          >
            <MaterialIcons name="verified-user" size={12} color={trustColor} />
            <Text style={[s.trustPillText, { color: trustColor }]}>
              {trustScore}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Search Bar — tapping opens the Search Modal */}
      <TouchableOpacity
        style={s.searchBarBtn}
        onPress={openSearchModal}
        activeOpacity={0.85}
      >
        <MaterialIcons
          name="search"
          size={20}
          color="#C24E00"
          style={{ marginLeft: 12 }}
        />
        <Text style={s.searchBarBtnText}>
          Where to, {profile ? profile.full_name : 'you'}?
        </Text>
        <View style={s.searchBarArrow}>
          <MaterialIcons name="keyboard-arrow-up" size={18} color="#C24E00" />
        </View>
      </TouchableOpacity>

      {/* Primary CTAs */}
      <View style={s.ctaRow}>
        <TouchableOpacity
          style={s.postRideBtn}
          onPress={() => router.push('/(tabs)/post-ride')}
          activeOpacity={0.87}
        >
          <MaterialIcons name="drive-eta" size={18} color="#fff" />
          <Text style={s.postRideBtnText}>
            Driving somewhere? Post a Ride
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      {sheetExpanded && (
        <View style={s.logoutSection}>
          <TouchableOpacity
            style={s.logoutCard}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <View style={s.logoutIconWrap}>
              <MaterialIcons name="logout" size={18} color="#e53935" />
            </View>
            <View style={s.logoutTextWrap}>
              <Text style={s.logoutTitle}>Log Out</Text>
              <Text style={s.logoutEmail} numberOfLines={1}>
                {profile?.email}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

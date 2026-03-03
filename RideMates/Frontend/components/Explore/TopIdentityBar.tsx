// =============================================================================
// components/Explore/TopIdentityBar.tsx — Avatar + Trust Ring + Role Badge
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { UserProfile, getInitials } from './constants';
import { useAlert } from '../ui/AlertContext';

interface TopIdentityBarProps {
  profile: UserProfile | null;
  trustScore: number;
  trustColor: string;
  isFaculty: boolean;
}

export default function TopIdentityBar({
  profile,
  trustScore,
  trustColor,
  isFaculty,
}: TopIdentityBarProps) {
  const { showAlert } = useAlert();
  return (
    <SafeAreaView style={s.topBarSafe} pointerEvents="box-none">
      <View style={s.topBar}>
        {/* Avatar with role badge */}
        <TouchableOpacity
          style={s.avatarWrapper}
          onPress={() =>
            showAlert({
              type: 'info',
              title: 'Profile',
              message: `${profile?.full_name}\n${profile?.email}\nRole: ${profile?.role}\nTrust Score: ${trustScore}`,
            })
          }
          activeOpacity={0.85}
        >
          {/* Trust score ring */}
          <View style={[s.avatarRing, { borderColor: trustColor }]}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarInitials}>
                {profile ? getInitials(profile.full_name) : 'U'}
              </Text>
            </View>
          </View>
          {/* Role badge */}
          <View
            style={[
              s.roleBadge,
              isFaculty ? s.roleBadgeFaculty : s.roleBadgeStudent,
            ]}
          >
            <MaterialIcons
              name={isFaculty ? 'badge' : 'school'}
              size={10}
              color="#fff"
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

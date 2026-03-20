// =============================================================================
// components/Explore/TopIdentityBar.tsx — Avatar + Trust Ring + Role Badge
// =============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { UserProfile, getInitials } from './constants';
import ProfileModal from './ProfileModal';

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
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SafeAreaView style={s.topBarSafe} pointerEvents="box-none">
        <View style={s.topBar}>
          {/* Avatar with role badge */}
          <TouchableOpacity
            style={s.avatarWrapper}
            onPress={() => setModalVisible(true)}
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
      <ProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        profile={profile}
        trustScore={trustScore}
        isFaculty={isFaculty}
      />
    </>
  );
}

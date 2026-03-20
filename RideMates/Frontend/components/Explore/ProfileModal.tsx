import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { s } from './styles';
import { UserProfile, getInitials } from './constants';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  trustScore: number;
  isFaculty: boolean;
}

export default function ProfileModal({
  visible,
  onClose,
  profile,
  trustScore,
  isFaculty,
}: ProfileModalProps) {
  if (!profile) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.profileModalOverlay}>
          <TouchableWithoutFeedback>
            <View style={s.profileModalCard}>
              {/* Close Button */}
              <TouchableOpacity style={s.profileModalClose} onPress={onClose} activeOpacity={0.7}>
                <Feather name="x" size={20} color="#888" />
              </TouchableOpacity>

              {/* Avatar */}
              <View style={s.profileModalAvatarWrap}>
                <Text style={s.profileModalInitials}>
                  {getInitials(profile.full_name)}
                </Text>
              </View>

              {/* Name */}
              <Text style={s.profileModalName}>{profile.full_name}</Text>

              {/* Email */}
              <View style={s.profileModalDivider} />
              <View style={s.profileModalRow}>
                <MaterialIcons name="mail" size={20} color="#1B263B" />
                <Text style={s.profileModalRowText} numberOfLines={1}>
                  {profile.email}
                </Text>
              </View>

              {/* Role */}
              <View style={s.profileModalDivider} />
              <View style={s.profileModalRow}>
                <MaterialIcons name="school" size={20} color="#1B263B" />
                <Text style={s.profileModalRowText} numberOfLines={1}>
                  {isFaculty ? 'Faculty' : 'Student'}
                </Text>
              </View>

              {/* Trust Score */}
              <View style={s.profileModalDivider} />
              <View style={s.profileModalRow}>
                <View style={s.profileModalTrustBadge}>
                  <MaterialIcons name="verified-user" size={14} color="#fff" />
                  <Text style={s.profileModalTrustBadgeText}>{trustScore}</Text>
                </View>
                <Text style={s.profileModalTrustText}>Trust Score: {trustScore}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

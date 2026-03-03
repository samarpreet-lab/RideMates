// =============================================================================
// components/Auth/InfoBox.tsx — Info / Warning Box with Icon
// =============================================================================
// Small info callout with a MaterialIcons icon and descriptive text.
// Used on both Signup and Login email steps.
// =============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authStyles as s } from './styles';

interface InfoBoxProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  text: string;
}

export default function InfoBox({ iconName, text }: InfoBoxProps) {
  return (
    <View style={s.infoTextContainer}>
      <MaterialIcons name={iconName} size={16} color="#ff8c42" style={s.infoIcon} />
      <Text style={s.infoText}>{text}</Text>
    </View>
  );
}

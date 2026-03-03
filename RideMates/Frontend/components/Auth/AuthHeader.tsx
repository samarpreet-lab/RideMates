// =============================================================================
// components/Auth/AuthHeader.tsx — Logo + Description Header
// =============================================================================
// Shared header used on both Signup and Login screens.
// =============================================================================

import React from 'react';
import { View, Text, Image } from 'react-native';
import { authStyles as s } from './styles';

interface AuthHeaderProps {
  description: string;
}

export default function AuthHeader({ description }: AuthHeaderProps) {
  return (
    <View style={s.headerSection}>
      <Image
        source={require('../../assets/pictures/Untitled design.png')}
        style={s.logo}
        resizeMode="contain"
      />
      <Text style={s.description}>{description}</Text>
    </View>
  );
}

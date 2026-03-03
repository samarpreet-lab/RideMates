// =============================================================================
// components/Auth/AuthFooterLink.tsx — Footer Link Section
// =============================================================================
// Bottom section with a text + link, e.g. "Already have an account? Log in"
// Used on both Signup and Login screens.
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { authStyles as s } from './styles';

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  onPress: () => void;
  loading?: boolean;
}

export default function AuthFooterLink({
  text,
  linkText,
  onPress,
  loading = false,
}: AuthFooterLinkProps) {
  return (
    <View style={s.footerSection}>
      <Text style={s.footerText}>{text}</Text>
      <TouchableOpacity disabled={loading} onPress={onPress} activeOpacity={0.7}>
        <Text style={s.footerLink}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

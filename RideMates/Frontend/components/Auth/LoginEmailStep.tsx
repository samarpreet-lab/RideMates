// =============================================================================
// components/Auth/LoginEmailStep.tsx — Login Email Step
// =============================================================================
// First step of login: LPU email input + info box + Send OTP button.
// =============================================================================

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { authStyles as s } from './styles';
import FormInput from './FormInput';
import InfoBox from './InfoBox';

interface LoginEmailStepProps {
  email: string;
  setEmail: (val: string) => void;
  emailFound: boolean;
  loading: boolean;
  onSendOTP: () => void;
}

export default function LoginEmailStep({
  email,
  setEmail,
  emailFound,
  loading,
  onSendOTP,
}: LoginEmailStepProps) {
  return (
    <>
      <Text style={s.sectionTitle}>Log in securely</Text>
      <Text style={s.subtitleText}>
        Enter your LPU ID to receive a secure login code.
      </Text>

      <FormInput
        label="LPU email ID"
        statusBadge={emailFound ? 'Found' : undefined}
        iconName="email"
        placeholder="example@lpu.in"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <InfoBox
        iconName="lock"
        text="We only send OTP to authentic LPU email addresses to ensure network safety."
      />

      <TouchableOpacity
        style={[s.continueButton, s.fullWidthButton, loading && s.buttonDisabled]}
        onPress={onSendOTP}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={s.continueButtonText}>Send OTP</Text>
            <Text style={s.arrow}> →</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

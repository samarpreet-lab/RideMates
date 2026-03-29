// =============================================================================
// components/Auth/SignupEmailStep.tsx — Signup Email Step
// =============================================================================
// First step of signup: full name + LPU email + info box + Send OTP button.
// =============================================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { authStyles as s } from './styles';
import FormInput from './FormInput';
import InfoBox from './InfoBox';

interface SignupEmailStepProps {
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  loading: boolean;
  onSendOTP: () => void;
}

export default function SignupEmailStep({
  fullName,
  setFullName,
  email,
  setEmail,
  loading,
  onSendOTP,
}: SignupEmailStepProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={s.sectionTitle}>Sign up with your LPU EMAIL-ID</Text>
        <Text style={s.subtitleText}>
          Please verify your university email before you can join rides.
        </Text>

        <FormInput
          label="Full name"
          labelHint="As per university ID"
          iconName="person"
          placeholder="First Last Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!loading}
        />

        <FormInput
          label="LPU email ID"
          labelHint="Gmail & others are blocked"
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
          text="We use your university email to ensure every driver and passenger is an actual LPU student. No outsiders."
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

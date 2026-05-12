// =============================================================================
// components/Auth/OtpStep.tsx — OTP Verification Step
// =============================================================================
// Shared OTP step used by both Signup and Login screens.
// Renders the OTP input, resend link, expiry warning, and back/verify buttons.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authStyles as s } from './styles';

interface OtpStepProps {
  otp: string;
  setOtp: (val: string) => void;
  loading: boolean;
  timer: number;
  otpSent: boolean;
  onResend: () => void;
  onBack: () => void;
  onVerify: () => void;
  verifyButtonText: string;
}

export default function OtpStep({
  otp,
  setOtp,
  loading,
  timer,
  otpSent,
  onResend,
  onBack,
  onVerify,
  verifyButtonText,
}: OtpStepProps) {
  // FIX: Only allow numeric input and enforce 6-digit max
  const handleOtpChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanText);
  };

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
        <View style={s.inputGroup}>
        <View style={s.labelRow}>
          <Text style={s.label}>6-Digit OTP</Text>
          {otpSent && <Text style={s.statusBadge}>Sent to your email</Text>}
        </View>
        <View style={s.otpInputWrapper}>
          <TextInput
            style={s.otpInput}
            placeholder="000000"
            placeholderTextColor="#ccc"
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>
      </View>

      <View style={s.resendContainer}>
        <Text style={s.resendText}>Didn&#39;t receive OTP? </Text>
        <TouchableOpacity onPress={onResend} disabled={timer > 0 || loading}>
          <Text style={[s.resendLink, timer > 0 && s.resendLinkDisabled]}>
            {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={s.warningContainer}>
        <MaterialIcons name="info" size={16} color="#C24E00" />
        <Text style={s.warningText}>
          OTP will expire in <Text style={s.warningBold}>10 minutes</Text>
        </Text>
      </View>

      <View style={s.buttonGroup}>
        <TouchableOpacity
          style={[s.secondaryButton, { flex: 0.7, paddingHorizontal: 10 }, loading && s.buttonDisabled]}
          onPress={onBack}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={s.secondaryButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.continueButton, { flex: 1.3, paddingHorizontal: 10 }, loading && s.buttonDisabled]}
          onPress={onVerify}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={s.continueButtonText} numberOfLines={1} adjustsFontSizeToFit>{verifyButtonText}</Text>
              <Text style={s.arrow}> →</Text>
            </>
          )}
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

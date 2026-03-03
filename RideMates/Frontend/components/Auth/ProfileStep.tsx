// =============================================================================
// components/Auth/ProfileStep.tsx — Profile Completion Step (Signup only)
// =============================================================================
// Third step of signup: displays name (read-only), phone input, gender picker,
// and back/complete buttons.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { authStyles as s } from './styles';
import FormInput from './FormInput';
import GenderPicker from './GenderPicker';

interface ProfileStepProps {
  fullName: string;
  phone: string;
  setPhone: (val: string) => void;
  gender: 'male' | 'female' | 'other';
  setGender: (val: 'male' | 'female' | 'other') => void;
  loading: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export default function ProfileStep({
  fullName,
  phone,
  setPhone,
  gender,
  setGender,
  loading,
  onBack,
  onComplete,
}: ProfileStepProps) {
  return (
    <>
      <Text style={s.sectionTitle}>Let's build your Campus Identity.</Text>
      <Text style={s.subtitleText}>
        Drivers and co-passengers will see this to recognize you at the LPU Main Gate.
      </Text>

      <FormInput
        label="Full Legal Name"
        placeholder={fullName}
        value=""
        editable={false}
        placeholderTextColor="#888"
      />

      <FormInput
        label="Phone Number"
        statusBadge="Required"
        iconName="phone"
        placeholder="+91 98765 43210"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
        helperText="Never shared publicly. Only visible to driver/passenger after a ride is confirmed."
      />

      <GenderPicker gender={gender} setGender={setGender} loading={loading} />

      <View style={s.buttonGroup}>
        <TouchableOpacity
          style={[s.secondaryButton, loading && s.buttonDisabled]}
          onPress={onBack}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={s.secondaryButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.continueButton, loading && s.buttonDisabled]}
          onPress={onComplete}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={s.continueButtonText}>Complete</Text>
              <Text style={s.arrow}> →</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

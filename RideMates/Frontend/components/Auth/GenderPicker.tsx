// =============================================================================
// components/Auth/GenderPicker.tsx — Gender Selection
// =============================================================================
// Three-option gender picker used on the Signup profile step.
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { authStyles as s } from './styles';

interface GenderPickerProps {
  gender: 'male' | 'female' | 'other';
  setGender: (val: 'male' | 'female' | 'other') => void;
  loading: boolean;
}

const GENDERS = [
  { id: 'male' as const, label: '👨 Male' },
  { id: 'female' as const, label: '👩 Female' },
  { id: 'other' as const, label: '👤 Other' },
];

export default function GenderPicker({ gender, setGender, loading }: GenderPickerProps) {
  return (
    <View style={s.inputGroup}>
      <View style={s.labelRow}>
        <Text style={s.label}>Gender</Text>
      </View>
      <View style={s.genderContainer}>
        {GENDERS.map(({ id, label }) => (
          <TouchableOpacity
            key={id}
            style={[s.genderOption, gender === id && s.genderOptionSelected]}
            onPress={() => setGender(id)}
            disabled={loading}
          >
            <Text
              style={[
                s.genderOptionText,
                gender === id && s.genderOptionTextSelected,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

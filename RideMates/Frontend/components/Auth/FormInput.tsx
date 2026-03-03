// =============================================================================
// components/Auth/FormInput.tsx — Labeled Input with Optional Icon
// =============================================================================
// Reusable input field with label, optional hint/badge, optional icon,
// and optional helper text. Used across Signup & Login screens.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authStyles as s } from './styles';

interface FormInputProps {
  label: string;
  labelHint?: string;
  statusBadge?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholderTextColor?: string;
  maxLength?: number;
  helperText?: string;
  // Optional style overrides
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export default function FormInput({
  label,
  labelHint,
  statusBadge,
  iconName,
  placeholder,
  value,
  onChangeText,
  editable = true,
  keyboardType,
  autoCapitalize,
  placeholderTextColor = '#b0b0b0',
  maxLength,
  helperText,
  containerStyle,
  inputWrapperStyle,
  inputStyle,
  labelStyle,
}: FormInputProps) {
  return (
    <View style={[s.inputGroup, containerStyle]}>
      <View style={s.labelRow}>
        <Text style={[s.label, labelStyle]}>{label}</Text>
        {labelHint && <Text style={s.labelHint}>{labelHint}</Text>}
        {statusBadge && <Text style={s.statusBadge}>{statusBadge}</Text>}
      </View>
      <View style={[s.inputWrapper, inputWrapperStyle]}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={20}
            color="#ff8c42"
            style={s.inputIconMaterial}
          />
        )}
        <TextInput
          style={[s.inputWithIcon, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
        />
      </View>
      {helperText && (
        <Text style={[s.statusBadge, { marginTop: 12 }]}>{helperText}</Text>
      )}
    </View>
  );
}

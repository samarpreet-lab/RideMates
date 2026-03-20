import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Linking, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export type StatusTheme = 'success' | 'warning' | 'error' | 'info';

export interface RideStatusModalProps {
  visible: boolean;
  type?: StatusTheme;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;
  pillText?: string;
  rideDetails?: {
    origin: string;
    destination: string;
    timeString: string;
    vehicleTypes: string; // e.g., "White Car • 3 Seats"
  };
  primaryAction: {
    label: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  contactActions?: {
    driverPhone?: string;
    passengerName?: string;
    driverName?: string;
    origin?: string;
    destination?: string;
  };
}

const THEME_COLORS = {
  success: {
    primary: '#D9622A', // Orange from the design
    light: '#FFE5D4',
    pillBg: '#FFF2E8',
    pillText: '#D9622A',
  },
  warning: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    pillBg: '#FFFBEB',
    pillText: '#D97706',
  },
  error: {
    primary: '#EF4444',
    light: '#FEE2E2',
    pillBg: '#FEF2F2',
    pillText: '#DC2626',
  },
  info: {
    primary: '#3B82F6',
    light: '#DBEAFE',
    pillBg: '#EFF6FF',
    pillText: '#2563EB',
  }
};

export default function RideStatusModal({
  visible,
  type = 'success',
  iconName = 'shield',
  title,
  message,
  pillText = 'LPU NETWORK SECURED',
  rideDetails,
  primaryAction,
  secondaryAction,
  contactActions,
}: RideStatusModalProps) {
  if (!visible) return null;

  const colors = THEME_COLORS[type];

  const handleWhatsApp = async () => {
    if (!contactActions?.driverPhone) return;
    const raw = contactActions.driverPhone.replace(/\D/g, '') || '';
    const finalPhone = raw.length === 10 ? `91${raw}` : raw;
    const name = contactActions.passengerName?.trim() || 'A passenger';
    const msgContext = contactActions.origin ? ` from *${contactActions.origin}* to *${contactActions.destination}*` : '';
    const message = `Hi ${contactActions.driverName || 'there'}! I'm ${name} from RideMates. 🚗\nI just booked a seat on your ride${msgContext}.\nWhere exactly should we meet for pickup?`;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url).catch(() => {});
    } else {
      Alert.alert('WhatsApp Not Found', 'WhatsApp is not installed on this device.');
    }
  };

  const handleCall = async () => {
    if (!contactActions?.driverPhone) return;
    const url = `tel:${contactActions.driverPhone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={primaryAction.onPress}>
      <TouchableWithoutFeedback onPress={primaryAction.onPress}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback>
            <View style={s.card}>
              {/* Icon / Shield */}
              <View style={[s.iconGlow, { backgroundColor: colors.light, shadowColor: colors.primary }]}>
                <MaterialCommunityIcons name={iconName} size={44} color={colors.primary} />
              </View>

              {/* Pill */}
              {pillText && (
                <View style={[s.pill, { backgroundColor: colors.pillBg }]}>
                  <Text style={[s.pillText, { color: colors.pillText }]}>{pillText}</Text>
                </View>
              )}

              <Text style={s.title}>{title}</Text>
              <Text style={s.message}>{message}</Text>

              {/* Ride Details Card */}
              {rideDetails && (
                <View style={s.rideCardBox}>
                  <View style={s.rideCardRow}>
                    <View>
                      <View style={s.rideCardRouteTop} />
                      <View style={s.rideCardRouteLine} />
                    </View>
                    <Text style={s.rideCardRouteText}>{rideDetails.origin} to {rideDetails.destination}</Text>
                  </View>

                  <View style={s.rideCardSubRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#444" />
                    <Text style={s.rideCardSubText}>{rideDetails.timeString}</Text>
                  </View>

                  <View style={s.rideCardSubRow}>
                    <MaterialCommunityIcons name="car-side" size={16} color="#444" />
                    <Text style={s.rideCardSubText}>{rideDetails.vehicleTypes}</Text>
                  </View>
                </View>
              )}

              {/* Contact Actions (for booking) */}
              {contactActions && contactActions.driverPhone && (
                <View style={s.contactRow}>
                  <TouchableOpacity style={[s.contactBtn, { borderColor: THEME_COLORS.success.primary, backgroundColor: THEME_COLORS.success.pillBg }]} onPress={handleWhatsApp} activeOpacity={0.8}>
                    <MaterialIcons name="chat" size={18} color={THEME_COLORS.success.primary} />
                    <Text style={[s.contactBtnText, { color: THEME_COLORS.success.primary }]}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.contactBtn, { borderColor: THEME_COLORS.success.primary, backgroundColor: THEME_COLORS.success.pillBg }]} onPress={handleCall} activeOpacity={0.8}>
                    <MaterialIcons name="call" size={18} color={THEME_COLORS.success.primary} />
                    <Text style={[s.contactBtnText, { color: THEME_COLORS.success.primary }]}>Call</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Primary Action */}
              <TouchableOpacity style={[s.primaryBtn, { backgroundColor: colors.primary }]} onPress={primaryAction.onPress} activeOpacity={0.8}>
                <Text style={s.primaryBtnText}>{primaryAction.label}</Text>
                {primaryAction.icon && <MaterialIcons name={primaryAction.icon} size={18} color="#fff" />}
              </TouchableOpacity>

              {/* Secondary Action */}
              {secondaryAction && (
                <TouchableOpacity style={s.secondaryBtn} onPress={secondaryAction.onPress} activeOpacity={0.7}>
                  <Text style={[s.secondaryText, { color: colors.primary }]}>{secondaryAction.label}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    width: '85%', backgroundColor: '#fff',
    borderRadius: 24, padding: 24, alignItems: 'center',
    elevation: 10, shadowColor: '#000',
    shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  iconGlow: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowOpacity: 0.8,
    shadowRadius: 15, shadowOffset: { width: 0, height: 0 },
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, marginBottom: 16,
  },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#1B263B', marginBottom: 12, textAlign: 'center' },
  message: {
    fontSize: 13, color: '#666', textAlign: 'center',
    lineHeight: 20, marginBottom: 20, paddingHorizontal: 4,
  },
  rideCardBox: {
    width: '100%', backgroundColor: '#F0F2F5',
    borderRadius: 16, padding: 16, marginBottom: 24,
  },
  rideCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  rideCardRouteTop: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#888' },
  rideCardRouteLine: { width: 1, height: 14, backgroundColor: '#888', marginLeft: 3, marginVertical: 2 },
  rideCardRouteText: { fontSize: 14, fontWeight: '700', color: '#1B263B', flex: 1 },
  rideCardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 20, marginBottom: 6 },
  rideCardSubText: { fontSize: 13, color: '#444', fontWeight: '500' },
  contactRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 },
  contactBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1,
  },
  contactBtnText: { fontSize: 14, fontWeight: '700' },
  primaryBtn: {
    width: '100%', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
    marginBottom: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondaryBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  secondaryText: { fontSize: 13, fontWeight: '700' },
});

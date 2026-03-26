// =============================================================================
// components/Auth/styles.ts — Shared Auth Screen Styles
// =============================================================================
// Common styles used across Signup (index.tsx) and Login (login.tsx) screens.
// =============================================================================

import { StyleSheet } from 'react-native';
import { sp, fs, wp, hp } from '@/constants/responsive';

export const authStyles = StyleSheet.create({
  // ─── Screen Containers ────────────────────────────────
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(20),
    paddingTop: hp(50),
    paddingBottom: hp(30),
  },

  // ─── Header ───────────────────────────────────────────
  headerSection: {
    alignItems: 'center',
    marginBottom: hp(24),
    backgroundColor: '#fff',
    borderRadius: sp(12),
    paddingHorizontal: wp(20),
    paddingVertical: hp(24),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: sp(6),
    shadowOffset: { width: 0, height: 1 },
  },
  logo: {
    width: wp(250),
    height: hp(150),
    marginBottom: hp(10),
  },
  description: {
    fontSize: fs(13),
    color: '#6B5344',
    textAlign: 'center',
    lineHeight: fs(18),
  },

  // ─── Form Container ──────────────────────────────────
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: sp(12),
    paddingHorizontal: wp(20),
    paddingVertical: hp(24),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: sp(8),
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: fs(18),
    fontWeight: '700',
    color: '#1E1610',
    marginBottom: hp(8),
    marginTop: 0,
  },
  subtitleText: {
    fontSize: fs(13),
    color: '#6B5344',
    marginBottom: hp(20),
    lineHeight: fs(18),
  },

  // ─── Input ────────────────────────────────────────────
  inputGroup: {
    marginBottom: hp(16),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(8),
  },
  label: {
    fontSize: fs(13),
    fontWeight: '600',
    color: '#3D2F22',
  },
  labelHint: {
    fontSize: fs(12),
    color: '#A8937F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
    borderWidth: 1,
    borderColor: '#C24E00',
    borderRadius: sp(8),
    paddingHorizontal: wp(12),
    paddingVertical: hp(10),
  },
  inputIconMaterial: {
    marginRight: wp(10),
  },
  inputWithIcon: {
    flex: 1,
    fontSize: fs(15),
    color: '#1E1610',
    paddingVertical: hp(2),
  },

  // ─── Status Badge ────────────────────────────────────
  statusBadge: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#C24E00',
    backgroundColor: '#FEF0E4',
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    borderRadius: sp(6),
    overflow: 'hidden',
  },

  // ─── OTP Input ───────────────────────────────────────
  otpInputWrapper: {
    backgroundColor: '#FAF7F4',
    borderWidth: sp(2),
    borderColor: '#C24E00',
    borderRadius: sp(14),
    paddingHorizontal: wp(24),
    paddingVertical: hp(18),
    elevation: 2,
    shadowColor: '#C24E00',
    shadowOpacity: 0.1,
    shadowRadius: sp(6),
    shadowOffset: { width: 0, height: 2 },
  },
  otpInput: {
    fontSize: fs(40),
    fontWeight: '900',
    color: '#C24E00',
    textAlign: 'center',
    letterSpacing: sp(10),
    fontFamily: 'monospace',
  },

  // ─── Resend ──────────────────────────────────────────
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(16),
  },
  resendText: {
    fontSize: fs(12),
    color: '#6B5344',
  },
  resendLink: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#C24E00',
  },
  resendLinkDisabled: {
    color: '#EAE0D8',
  },

  // ─── Warning ─────────────────────────────────────────
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
    paddingHorizontal: wp(12),
  },
  warningText: {
    fontSize: fs(12),
    color: '#6B5344',
    marginLeft: wp(8),
  },
  warningBold: {
    fontWeight: '700',
    color: '#C24E00',
  },

  // ─── Info Box ────────────────────────────────────────
  infoTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(20),
    backgroundColor: '#F5F0EB',
    borderRadius: sp(8),
    paddingVertical: hp(12),
    paddingHorizontal: wp(14),
  },
  infoIcon: {
    marginRight: wp(10),
    marginTop: hp(2),
  },
  infoText: {
    fontSize: fs(13),
    color: '#6B5344',
    lineHeight: fs(18),
    flex: 1,
  },

  // ─── Buttons ─────────────────────────────────────────
  continueButton: {
    backgroundColor: '#C24E00',
    borderRadius: sp(12),
    paddingVertical: hp(14),
    paddingHorizontal: wp(20),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    elevation: 2,
    shadowColor: '#C24E00',
    shadowOpacity: 0.3,
    shadowRadius: sp(4),
    shadowOffset: { width: 0, height: 2 },
  },
  fullWidthButton: {
    marginTop: hp(8),
    marginBottom: hp(16),
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: sp(12),
    paddingVertical: hp(14),
    paddingHorizontal: wp(20),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    borderWidth: sp(2),
    borderColor: '#EAE0D8',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(12),
    marginBottom: hp(18),
    marginTop: hp(20),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: fs(16),
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#6B5344',
    fontSize: fs(16),
    fontWeight: '700',
  },
  arrow: {
    color: '#fff',
    fontSize: fs(18),
    fontWeight: '700',
  },

  // ─── Gender ──────────────────────────────────────────
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: sp(8),
    marginBottom: hp(16),
  },
  genderOption: {
    flex: 1,
    paddingVertical: hp(14),
    paddingHorizontal: wp(8),
    borderRadius: sp(12),
    backgroundColor: '#FAF7F4',
    borderWidth: sp(2),
    borderColor: '#EAE0D8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  genderOptionSelected: {
    backgroundColor: '#FFF8F2',
    borderColor: '#C24E00',
  },
  genderOptionText: {
    fontSize: fs(13),
    fontWeight: '600',
    color: '#6B5344',
    textAlign: 'center',
    flexShrink: 1,
  },
  genderOptionTextSelected: {
    color: '#C24E00',
    fontWeight: '700',
  },

  // ─── Footer Link ─────────────────────────────────────
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F4',
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
    borderRadius: sp(8),
    marginTop: hp(8),
  },
  footerText: {
    fontSize: fs(13),
    color: '#6B5344',
  },
  footerLink: {
    fontSize: fs(13),
    fontWeight: '700',
    color: '#C24E00',
  },
});

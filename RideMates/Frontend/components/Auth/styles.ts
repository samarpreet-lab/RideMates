// =============================================================================
// components/Auth/styles.ts — Shared Auth Screen Styles
// =============================================================================
// Common styles used across Signup (index.tsx) and Login (login.tsx) screens.
// =============================================================================

import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  // ─── Screen Containers ────────────────────────────────
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },

  // ─── Header ───────────────────────────────────────────
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  logo: {
    width: 250,
    height: 150,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#6B5344',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ─── Form Container ──────────────────────────────────
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1610',
    marginBottom: 8,
    marginTop: 0,
  },
  subtitleText: {
    fontSize: 13,
    color: '#6B5344',
    marginBottom: 20,
    lineHeight: 18,
  },

  // ─── Input ────────────────────────────────────────────
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D2F22',
  },
  labelHint: {
    fontSize: 12,
    color: '#A8937F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
    borderWidth: 1,
    borderColor: '#C24E00',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIconMaterial: {
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 15,
    color: '#1E1610',
    paddingVertical: 2,
  },

  // ─── Status Badge ────────────────────────────────────
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C24E00',
    backgroundColor: '#FEF0E4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },

  // ─── OTP Input ───────────────────────────────────────
  otpInputWrapper: {
    backgroundColor: '#FAF7F4',
    borderWidth: 2,
    borderColor: '#C24E00',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 18,
    elevation: 2,
    shadowColor: '#C24E00',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  otpInput: {
    fontSize: 40,
    fontWeight: '900',
    color: '#C24E00',
    textAlign: 'center',
    letterSpacing: 10,
    fontFamily: 'monospace',
  },

  // ─── Resend ──────────────────────────────────────────
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 12,
    color: '#6B5344',
  },
  resendLink: {
    fontSize: 12,
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
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#6B5344',
    marginLeft: 8,
  },
  warningBold: {
    fontWeight: '700',
    color: '#C24E00',
  },

  // ─── Info Box ────────────────────────────────────────
  infoTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: '#F5F0EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#6B5344',
    lineHeight: 18,
    flex: 1,
  },

  // ─── Buttons ─────────────────────────────────────────
  continueButton: {
    backgroundColor: '#C24E00',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    elevation: 2,
    shadowColor: '#C24E00',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fullWidthButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    borderWidth: 2,
    borderColor: '#EAE0D8',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#6B5344',
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // ─── Gender ──────────────────────────────────────────
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FAF7F4',
    borderWidth: 2,
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
    fontSize: 13,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B5344',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C24E00',
  },
});

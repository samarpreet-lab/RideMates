// =============================================================================
// login.tsx — Login Screen (2-step wizard: Email → OTP)
// =============================================================================
// Composed from shared Auth components in components/Auth/
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../components/ui/AlertContext';
import { useRouter } from 'expo-router';
import api, { saveToken } from '../../services/api';
import { authStyles as s } from '../../components/Auth/styles';

// Sub-components
import AuthHeader from '../../components/Auth/AuthHeader';
import LoginEmailStep from '../../components/Auth/LoginEmailStep';
import OtpStep from '../../components/Auth/OtpStep';
import AuthFooterLink from '../../components/Auth/AuthFooterLink';

type LoginStep = 'email' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>('email');
  const [emailFound, setEmailFound] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const validateEmail = () => {
    if (!email.trim()) {
      showAlert({ type: 'error', title: 'Error', message: 'Please enter your email' });
      return false;
    }
    if (!email.endsWith('@lpu.in')) {
      showAlert({ type: 'warning', title: 'Access Denied', message: 'Only @lpu.in email addresses are allowed.' });
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setEmailFound(true);
      setOtpSent(true);
      setTimer(60);
      setStep('otp');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      showAlert({ type: 'error', title: 'Error', message: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      showAlert({ type: 'error', title: 'Error', message: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { token } = response.data.data;

      await saveToken(token);

      // Reset form
      setEmail(''); setOtp(''); setStep('email');
      setEmailFound(false); setOtpSent(false);

      router.replace('/(tabs)/explore');
    } catch (error: any) {
      console.error('Verification error:', error);

      let errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';

      if (error.response?.data?.error === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.response?.data?.error === 'OTP_INVALID') {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (error.response?.data?.error === 'OTP_LOCKED') {
        errorMessage = 'Too many failed attempts. Please request a new OTP.';
      }

      showAlert({ type: 'error', title: 'Verification Failed', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setTimer(60);
      showAlert({ type: 'success', title: 'Success', message: 'OTP has been resent to your email' });
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Error', message: 'Failed to resend OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader description="Exclusive ride access for LPU students and staff" />

          <View style={s.formContainer}>
            {step === 'email' && (
              <LoginEmailStep
                email={email} setEmail={setEmail}
                emailFound={emailFound}
                loading={loading} onSendOTP={handleSendOTP}
              />
            )}

            {step === 'otp' && (
              <OtpStep
                otp={otp} setOtp={setOtp}
                loading={loading} timer={timer} otpSent={otpSent}
                onResend={handleResendOTP}
                onBack={() => { setStep('email'); setOtp(''); setTimer(0); }}
                onVerify={handleVerifyOTP}
                verifyButtonText="Verify & Log in"
              />
            )}

            <AuthFooterLink
              text="Don't have an account? "
              linkText="Sign up here"
              onPress={() => router.push('/(tabs)')}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

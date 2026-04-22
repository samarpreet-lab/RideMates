// =============================================================================
// index.tsx — Signup Screen (3-step wizard: Email → OTP → Profile)
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
import SignupEmailStep from '../../components/Auth/SignupEmailStep';
import OtpStep from '../../components/Auth/OtpStep';
import ProfileStep from '../../components/Auth/ProfileStep';
import AuthFooterLink from '../../components/Auth/AuthFooterLink';

type SignupStep = 'email' | 'otp' | 'profile';

export default function SignupScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SignupStep>('email');
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
    // FIX: Validate full name format (first + last name, min length)
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      showAlert({ type: 'error', title: 'Error', message: 'Please enter your full name' });
      return false;
    }
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 2) {
      showAlert({ type: 'error', title: 'Invalid Name', message: 'Please enter both first and last name' });
      return false;
    }
    if (nameParts.some(part => part.length < 2)) {
      showAlert({ type: 'error', title: 'Invalid Name', message: 'Each name part should be at least 2 characters' });
      return false;
    }
    
    if (!email.trim()) {
      showAlert({ type: 'error', title: 'Error', message: 'Please enter your email' });
      return false;
    }
    
    // FIX: Validate email format before checking domain
    const emailRegex = /^[a-zA-Z0-9._-]+@lpu\.in$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      showAlert({ type: 'warning', title: 'Invalid Email', message: 'Please enter a valid LPU email (e.g., john.doe@lpu.in)' });
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email, purpose: 'signup' });
      setOtpSent(true);
      setTimer(60);
      setStep('otp');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      showAlert({ type: 'error', title: 'Error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp.trim() || otp.length !== 6) {
      showAlert({ type: 'error', title: 'Error', message: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying OTP and creating account...');
      const response = await api.post('/auth/verify-otp', {
        email, otp, full_name: fullName, role: 'student', gender,
      });

      console.log('✅ OTP verified, response:', response.data);
      const { token } = response.data.data;

      await saveToken(token);
      console.log('💾 Token saved to secure store');

      console.log('📝 Moving to profile step...');
      setStep('profile');
      console.log('🎯 Step should now be: profile');
      showAlert({ type: 'success', title: 'Success', message: 'Now please complete your profile with phone number and gender selection.' });
    } catch (error: any) {
      console.error('❌ Signup error:', error);

      let errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';

      if (error.response?.data?.error === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.response?.data?.error === 'OTP_INVALID') {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (error.response?.data?.error === 'OTP_LOCKED') {
        errorMessage = 'Too many failed attempts. Please request a new OTP.';
      } else if (error.response?.data?.error === 'DUPLICATE_EMAIL') {
        errorMessage = 'An account with this email already exists. Please log in.';
      }

      showAlert({ type: 'error', title: 'Signup Failed', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email, purpose: 'signup' });
      setTimer(60);
      showAlert({ type: 'success', title: 'Success', message: 'OTP has been resent to your email' });
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Error', message: error.response?.data?.message || 'Failed to resend OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    // FIX: Validate phone format (Indian mobile number)
    const phoneClean = phone.trim().replace(/[\s-]/g, '');
    if (!phoneClean) {
      showAlert({ type: 'error', title: 'Error', message: 'Please enter your phone number' });
      return;
    }
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      showAlert({ type: 'error', title: 'Invalid Phone', message: 'Please enter a valid 10-digit Indian phone number' });
      return;
    }
    
    // FIX: Validate gender is explicitly selected
    if (gender === 'other') {
      showAlert({ 
        type: 'confirm', 
        title: 'Confirm Gender', 
        message: 'You selected "Other" as your gender. Is this correct?',
        onConfirm: () => completeProfileRequest()
      });
      return;
    }
    
    await completeProfileRequest();
  };
  
  const completeProfileRequest = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', { phone: phone.trim(), gender });

      showAlert({ type: 'success', title: 'Welcome!', message: 'Profile completed! Welcome to RideMates!' });

      // Clear form and reset
      setFullName(''); setEmail(''); setOtp(''); setPhone(''); setGender('other');
      setStep('email'); setOtpSent(false); setTimer(0);

      router.replace('/(tabs)/explore');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to complete profile. Please try again.';
      showAlert({ type: 'error', title: 'Error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader description="A closed community network, built just for LPU students and staff" />

          <View style={s.formContainer}>
            {step === 'email' && (
              <SignupEmailStep
                fullName={fullName} setFullName={setFullName}
                email={email} setEmail={setEmail}
                loading={loading} onSendOTP={handleSendOTP}
              />
            )}

            {step === 'otp' && (
              <OtpStep
                otp={otp} setOtp={setOtp}
                loading={loading} timer={timer} otpSent={otpSent}
                onResend={handleResendOTP}
                onBack={() => { setStep('email'); setOtp(''); setTimer(0); }}
                onVerify={handleVerifyAndSignup}
                verifyButtonText="Verify & Sign Up"
              />
            )}

            {step === 'profile' && (
              <ProfileStep
                fullName={fullName} phone={phone} setPhone={setPhone}
                gender={gender} setGender={setGender}
                loading={loading}
                onBack={() => setStep('otp')}
                onComplete={handleCompleteProfile}
              />
            )}

            <AuthFooterLink
              text="Already have an account? "
              linkText="Log in securely"
              onPress={() => router.push('/(tabs)/login')}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
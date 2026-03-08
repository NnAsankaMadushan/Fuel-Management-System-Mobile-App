import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { getApiErrorMessage } from '../../../utils/apiError';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import ScreenShell from '../../Components/UI/ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;
const brandIcon = require('../../../assets/images/icon.png');

const VerifyEmail = ({ navigation, route }) => {
  const {
    confirmSignupUser,
    requestEmailVerificationOtp,
    resendSignupOtp,
    verifyEmailVerificationOtp,
  } = useUser();
  const initialEmail = useMemo(() => {
    const value = route?.params?.email;
    return typeof value === 'string' ? value : '';
  }, [route?.params?.email]);
  const verificationContext = useMemo(
    () => (route?.params?.verificationContext === 'existing' ? 'existing' : 'signup'),
    [route?.params?.verificationContext],
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimerRef = useRef(null);
  const [infoMessage, setInfoMessage] = useState(
    route?.params?.signupMessage ||
      route?.params?.serverMessage ||
      (verificationContext === 'signup'
        ? 'Enter the OTP sent to your email to complete account creation.'
        : 'Enter the OTP sent to your email to verify your account.'),
  );

  useEffect(() => {
    const nextEmail = route?.params?.email;
    if (typeof nextEmail === 'string') {
      setEmail(nextEmail);
    }
  }, [route?.params?.email]);

  useEffect(() => {
    const baseMessage =
      route?.params?.signupMessage ||
      route?.params?.serverMessage ||
      (verificationContext === 'signup'
        ? 'Enter the OTP sent to your email to complete account creation.'
        : 'Enter the OTP sent to your email to verify your account.');
    setInfoMessage(baseMessage);
  }, [
    route?.params?.serverMessage,
    route?.params?.signupMessage,
    verificationContext,
  ]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) {
        globalThis.clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  const handleVerify = async () => {
    if (!email || !otp) {
      Alert.alert('Missing Fields', 'Enter both email and OTP.');
      return;
    }

    try {
      setIsVerifying(true);
      const response = verificationContext === 'signup'
        ? await confirmSignupUser(email, otp)
        : await verifyEmailVerificationOtp(email, otp);
      if (redirectTimerRef.current) {
        globalThis.clearTimeout(redirectTimerRef.current);
      }
      setIsRedirecting(true);
      Alert.alert('Email Verified', response?.message || 'Your email was verified successfully.');
      redirectTimerRef.current = globalThis.setTimeout(() => {
        redirectTimerRef.current = null;
        setIsRedirecting(false);
        navigation.navigate('Login', { email });
      }, 1200);
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        getApiErrorMessage(
          error,
          'Could not verify OTP. Please try again.',
          'Could not reach the server. Check that the backend is running and reachable from this device.',
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Enter your email to request a new OTP.');
      return;
    }

    try {
      setIsResending(true);
      const response = verificationContext === 'signup'
        ? await resendSignupOtp(email)
        : await requestEmailVerificationOtp(email);
      setInfoMessage(response?.message || 'A new OTP has been sent.');
      Alert.alert('OTP Requested', response?.message || 'A new OTP has been sent to your email.');
    } catch (error) {
      Alert.alert(
        'Resend Failed',
        getApiErrorMessage(
          error,
          'Could not request a new OTP.',
          'Could not reach the server. Check that the backend is running and reachable from this device.',
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScreenShell
      headerIcon={brandIcon}
      badge="Verify Email"
      title="Email verification"
      subtitle="Enter your 6-digit OTP to activate your account."
    >
      <View style={styles.formCard}>
        <AppInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          label="OTP"
          placeholder="6-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
        <AppButton
          title={isRedirecting ? 'Redirecting...' : 'Verify Email'}
          onPress={handleVerify}
          loading={isVerifying || isRedirecting}
        />
        <AppButton title="Resend OTP" onPress={handleResendOtp} variant="secondary" loading={isResending} />
      </View>

      {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already verified?</Text>
        <Pressable onPress={() => navigation.navigate('Login', { email })}>
          <Text style={styles.switchAction}>Sign in</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.md,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  switchText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  switchAction: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default VerifyEmail;

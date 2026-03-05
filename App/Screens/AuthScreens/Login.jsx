import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { getApiErrorMessage } from '../../../utils/apiError';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import ScreenShell from '../../Components/UI/ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;
const brandIcon = require('../../../assets/images/icon.png');

const Login = ({ navigation, route }) => {
  const { loginUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const prefilledEmail = route?.params?.email;
    if (prefilledEmail && typeof prefilledEmail === 'string') {
      setEmail(prefilledEmail);
    }
  }, [route?.params?.email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginUser(email, password);
    } catch (error) {
      if (error?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        navigation.navigate('VerifyEmail', {
          email,
          verificationContext: 'existing',
          serverMessage: error?.response?.data?.message || 'Email verification is required before logging in.',
        });
        return;
      }

      Alert.alert(
        'Login Failed',
        getApiErrorMessage(
          error,
          'Please check your credentials and try again.',
          'Could not reach the server. Check that the backend is running and this device is on the same network as your computer.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell
      headerIcon={brandIcon}
      badge="FuelPlus Mobile"
      title="Sign in"
      subtitle="Use your account to continue."
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
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppButton title="Log In" onPress={handleLogin} loading={isSubmitting} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Need an account?</Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.switchAction}>Create one</Text>
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

export default Login;

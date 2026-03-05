import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { getApiErrorMessage } from '../../../utils/apiError';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import ScreenShell from '../../Components/UI/ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;
const brandIcon = require('../../../assets/images/icon.png');

const roles = [
  { key: 'vehicle_owner', label: 'Vehicle Owner', tone: 'orange' },
  { key: 'station_owner', label: 'Station Owner', tone: 'teal' },
];

const SignUp = ({ navigation }) => {
  const { signupUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('vehicle_owner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !phoneNumber || !nicNumber || !password) {
      Alert.alert('Missing Fields', 'Fill in all required details before continuing.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signupUser(name, email, password, role, phoneNumber, nicNumber);
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        getApiErrorMessage(
          error,
          'Could not create your account.',
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
      badge="Create Account"
      title="Create account"
      subtitle="Choose a role and enter your details."
    >
      <View style={styles.roleRow}>
        {roles.map((item) => {
          const selected = item.key === role;
          return (
            <Pressable
              key={item.key}
              onPress={() => setRole(item.key)}
              style={[
                styles.roleChip,
                selected && {
                  borderColor: item.tone === 'teal' ? colors.teal : item.tone === 'dark' ? colors.surfaceDark : colors.accent,
                  backgroundColor: item.tone === 'teal' ? colors.tealSoft : item.tone === 'dark' ? colors.surfaceMuted : colors.accentSoft,
                },
              ]}
            >
              <Text style={styles.roleLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.formCard}>
        <AppInput label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
        <AppInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          label="Phone number"
          placeholder="0771234567"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <AppInput
          label="NIC number"
          placeholder="200012345678 or 123456789V"
          value={nicNumber}
          onChangeText={setNicNumber}
          autoCapitalize="characters"
        />
        <AppInput label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton title="Create Account" onPress={handleSignup} loading={isSubmitting} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchAction}>Sign in</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceStrong,
  },
  roleLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
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

export default SignUp;

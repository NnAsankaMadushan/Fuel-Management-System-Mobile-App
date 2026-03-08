import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import ScreenShell from '../../Components/UI/ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;

const ChangePasswordScreen = ({ isMandatory = false }) => {
  const { changePassword, logoutUser } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Current password, new password, and confirmation are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await changePassword(currentPassword, newPassword);
      resetForm();
      Alert.alert('Success', response?.message || 'Password changed successfully.');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell
      badge="Security"
      title="Change Password"
      subtitle={
        isMandatory
          ? 'You must change your temporary password before accessing the app.'
          : 'Update your password at any time from this screen.'
      }
    >
      <View style={styles.formCard}>
        {isMandatory ? <Text style={styles.noticeText}>First login detected. Set a new password to continue.</Text> : null}
        <AppInput
          label="Current password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <AppInput
          label="New password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <AppInput
          label="Confirm new password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <AppButton title="Update Password" onPress={handleUpdatePassword} loading={isSubmitting} />
      </View>

      <AppButton title="Logout" onPress={logoutUser} variant="logout" />
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
    ...shadow.sm,
  },
  noticeText: {
    color: colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default ChangePasswordScreen;

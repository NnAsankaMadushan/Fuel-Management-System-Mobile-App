import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { AppTheme, RoleAccents } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from './AppButton';
import AppInput from './AppInput';
import ScreenShell from './ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;

const ProfileScreenBase = ({ roleLabel }) => {
  const { logoutUser, user, updateUser, changePassword } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const roleAccent = RoleAccents[user?.role] || colors.accent;
  const roleCode = user?.role ? user.role.replace('_', ' ').slice(0, 2).toUpperCase() : 'PR';

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await axios.put(buildApiUrl(`/api/users/update/${user._id}`), {
        name,
        email,
        phoneNumber,
      }, buildMobileRequestConfig(user));

      updateUser({
        ...user,
        ...response.data.user,
      });
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Current password, new password, and confirmation are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await changePassword(currentPassword, newPassword);
      resetPasswordForm();
      setIsChangingPassword(false);
      Alert.alert('Success', response?.message || 'Password changed successfully.');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <ScreenShell
      badge="Profile"
      title={user?.name || 'Profile'}
      subtitle={roleLabel}
    >
      {isEditing ? (
        <View style={styles.formCard}>
          <AppInput label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="0771234567"
            keyboardType="phone-pad"
          />
          <View style={styles.buttonRow}>
            <AppButton title="Save Changes" onPress={handleSave} loading={isSaving} style={styles.buttonHalf} />
            <AppButton title="Cancel" onPress={() => setIsEditing(false)} variant="secondary" style={styles.buttonHalf} />
          </View>
        </View>
      ) : isChangingPassword ? (
        <View style={styles.formCard}>
          <AppInput
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
          />
          <AppInput
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
          <AppInput
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry
          />
          <View style={styles.buttonRow}>
            <AppButton title="Update Password" onPress={handlePasswordChange} loading={isSaving} style={styles.buttonHalf} />
            <AppButton
              title="Cancel"
              onPress={() => {
                resetPasswordForm();
                setIsChangingPassword(false);
              }}
              variant="secondary"
              style={styles.buttonHalf}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={[styles.avatar, { backgroundColor: roleAccent }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Role</Text>
              <Text style={styles.summaryValue}>{roleLabel}</Text>
              <Text style={styles.summaryCode}>{roleCode}</Text>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user?.email || 'Not available'}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{user?.phoneNumber || 'Not available'}</Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <AppButton
              title="Edit Profile"
              onPress={() => {
                setIsChangingPassword(false);
                setIsEditing(true);
              }}
              variant="secondary"
              style={styles.buttonHalf}
            />
            <AppButton
              title="Change Password"
              onPress={() => {
                setIsEditing(false);
                setIsChangingPassword(true);
              }}
              variant="secondary"
              style={styles.buttonHalf}
            />
          </View>
        </>
      )}

      <AppButton title="Logout" onPress={logoutUser} variant="logout" />
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
  },
  formCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  summaryCopy: {
    gap: 2,
    flex: 1,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryCode: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  infoGrid: {
    gap: spacing.md,
  },
  detailCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default ProfileScreenBase;

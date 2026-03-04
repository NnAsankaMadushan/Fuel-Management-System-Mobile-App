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
  const { logoutUser, user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
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
          <AppButton title="Edit Profile" onPress={() => setIsEditing(true)} variant="secondary" />
        </>
      )}

      <AppButton title="Logout" onPress={logoutUser} variant="danger" />
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

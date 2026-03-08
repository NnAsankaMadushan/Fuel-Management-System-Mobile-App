import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useThemedAlert } from '../../../context/ThemedAlertContext';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;
const getStationStatus = (station) => station?.verificationStatus || (station?.isVerified ? 'approved' : 'pending');

const OperatorsScreen = () => {
  const { user } = useUser();
  const { showAlert } = useThemedAlert();
  const [operators, setOperators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [hasRegisteredStation, setHasRegisteredStation] = useState(false);
  const [hasApprovedStation, setHasApprovedStation] = useState(false);
  const [isCheckingStationStatus, setIsCheckingStationStatus] = useState(true);

  const fetchOperators = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/stations/getAllStationOperators'), buildMobileRequestConfig(user));
      setOperators(response.data);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setOperators([]);
    }
  }, [user]);

  const hydrateScreen = useCallback(async () => {
    setIsCheckingStationStatus(true);

    try {
      const response = await axios.get(buildApiUrl('/api/stations/getAllStaionsByUserId'), buildMobileRequestConfig(user));
      const stationList = response.data || [];
      const registered = Array.isArray(stationList) && stationList.length > 0;
      const approved = Array.isArray(stationList) && stationList.some((station) => getStationStatus(station) === 'approved');
      setHasRegisteredStation(registered);
      setHasApprovedStation(approved);

      if (!registered) {
        setOperators([]);
        return;
      }

      if (!approved) {
        setOperators([]);
        return;
      }

      await fetchOperators();
    } catch (error) {
      console.error('Error checking station status:', error);
      setHasRegisteredStation(false);
      setHasApprovedStation(false);
      setOperators([]);
    } finally {
      setIsCheckingStationStatus(false);
    }
  }, [fetchOperators, user]);

  useFocusEffect(
    useCallback(() => {
      hydrateScreen();
    }, [hydrateScreen]),
  );

  const filteredOperators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return operators;
    }

    return operators.filter((operator) => operator.name?.toLowerCase().includes(query));
  }, [operators, searchQuery]);

  const addOperator = async () => {
    if (!hasRegisteredStation) {
      showAlert('Station Required', 'Register a station before adding operators.');
      return;
    }

    if (!hasApprovedStation) {
      showAlert('Approval Pending', 'Wait for admin approval before adding operators.');
      return;
    }

    if (!name || !email || !password || !phoneNumber || !nicNumber) {
      showAlert('Missing Fields', 'All operator fields are required.');
      return;
    }

    try {
      await axios.post(
        buildApiUrl('/api/stations/addStationOperator'),
        {
          name,
          email,
          password,
          phoneNumber,
          nicNumber,
        },
        buildMobileRequestConfig(user),
      );
      setIsModalVisible(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setNicNumber('');
      fetchOperators();
      showAlert('Success', 'Operator added successfully. They must change this temporary password on first login.');
    } catch (error) {
      console.error('Error adding operator:', error);
      showAlert('Error', error.response?.data?.message || 'Could not add operator.');
    }
  };

  const removeOperator = async (operatorId) => {
    try {
      await axios.delete(buildApiUrl(`/api/stations/deleteStationOperator/${operatorId}`), buildMobileRequestConfig(user));
      fetchOperators();
      setSelectedOperator(null);
      showAlert('Success', 'Operator removed successfully.');
    } catch (error) {
      console.error('Error removing operator:', error);
      showAlert('Error', error.response?.data?.message || 'Could not remove operator.');
    }
  };

  return (
    <ScreenShell
      badge="Operators"
      title="Operators"
      subtitle="Create, review, and remove operator accounts."
      scroll={false}
      contentContainerStyle={styles.shellBody}
    >
      <FlatList
        style={styles.list}
        data={filteredOperators}
        keyExtractor={(item) => item._id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.metricGrid}>
              <MetricCard label="Operators" value={`${operators.length}`} tone="dark" style={styles.metricCard} />
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader
                badge="Records"
                title="Operator accounts"
                subtitle="Search by operator name."
                trailing={
                  <AppButton
                    title="Add Operator"
                    onPress={() => setIsModalVisible(true)}
                    disabled={!hasApprovedStation || isCheckingStationStatus}
                  />
                }
              />
              <View style={styles.searchPanel}>
                <AppInput placeholder="Search by name..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} />
              </View>
              {!isCheckingStationStatus && !hasRegisteredStation ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Station required</Text>
                  <Text style={styles.emptyText}>Register a station first to create operator accounts.</Text>
                </View>
              ) : !isCheckingStationStatus && !hasApprovedStation ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Approval pending</Text>
                  <Text style={styles.emptyText}>Admin approval is required before operator accounts can be created.</Text>
                </View>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedOperator(item)} style={styles.listCard}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.email}</Text>
            <Text style={styles.cardMeta}>{item.phoneNumber}</Text>
            <Text style={styles.cardMeta}>{item.nicNumber}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {hasRegisteredStation ? (hasApprovedStation ? 'No operators found' : 'Approval pending') : 'No station registered'}
            </Text>
            <Text style={styles.emptyText}>
              {hasRegisteredStation
                ? hasApprovedStation
                  ? 'Create an operator to populate this list.'
                  : 'Wait for admin approval, then create your first operator account.'
                : 'Register a station first, then create your first operator account.'}
            </Text>
          </View>
        }
      />

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Operator</Text>
            <View style={styles.formStack}>
              <AppInput placeholder="Name" value={name} onChangeText={setName} />
              <AppInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <AppInput label="Temporary password" placeholder="Set an initial password" value={password} onChangeText={setPassword} secureTextEntry />
              <AppInput placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
              <AppInput placeholder="NIC Number" value={nicNumber} onChangeText={setNicNumber} autoCapitalize="characters" />
            </View>
            <View style={styles.buttonStack}>
              <AppButton title="Add Operator" onPress={addOperator} disabled={!hasApprovedStation} />
              <AppButton title="Cancel" onPress={() => setIsModalVisible(false)} variant="secondary" />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedOperator} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {selectedOperator ? (
              <>
                <Text style={styles.modalTitle}>{selectedOperator.name}</Text>
                <Text style={styles.cardMeta}>{selectedOperator.email}</Text>
                <Text style={styles.cardMeta}>{selectedOperator.phoneNumber}</Text>
                <Text style={styles.cardMeta}>{selectedOperator.nicNumber}</Text>
                <View style={styles.buttonStack}>
                  <AppButton title="Remove Operator" onPress={() => removeOperator(selectedOperator._id)} variant="danger" />
                  <AppButton title="Close" onPress={() => setSelectedOperator(null)} variant="secondary" />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  shellBody: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listHeader: {
    gap: spacing.lg,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: '100%',
  },
  sectionBlock: {
    gap: spacing.md,
  },
  searchInput: {
    width: '100%',
  },
  searchPanel: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContent: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  listCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.overlay,
  },
  modalCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    ...shadow.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  formStack: {
    gap: spacing.sm,
  },
  buttonStack: {
    gap: spacing.sm,
  },
});

export default OperatorsScreen;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const OperatorsScreen = () => {
  const { user } = useUser();
  const [operators, setOperators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const fetchOperators = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/stations/getAllStationOperators'), buildMobileRequestConfig(user));
      setOperators(response.data);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const filteredOperators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return operators;
    }

    return operators.filter((operator) => operator.name?.toLowerCase().includes(query));
  }, [operators, searchQuery]);

  const addOperator = async () => {
    if (!name || !email || !password || !phoneNumber) {
      Alert.alert('Missing Fields', 'All operator fields are required.');
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
        },
        buildMobileRequestConfig(user),
      );
      setIsModalVisible(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      fetchOperators();
      Alert.alert('Success', 'Operator added successfully.');
    } catch (error) {
      console.error('Error adding operator:', error);
      Alert.alert('Error', error.response?.data?.message || 'Could not add operator.');
    }
  };

  const removeOperator = async (operatorId) => {
    try {
      await axios.delete(buildApiUrl(`/api/stations/deleteStationOperator/${operatorId}`), buildMobileRequestConfig(user));
      fetchOperators();
      setSelectedOperator(null);
      Alert.alert('Success', 'Operator removed successfully.');
    } catch (error) {
      console.error('Error removing operator:', error);
      Alert.alert('Error', error.response?.data?.message || 'Could not remove operator.');
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
      <View style={styles.metricGrid}>
        <MetricCard label="Operators" value={`${operators.length}`} style={styles.metricCard} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="Records"
          title="Operator accounts"
          subtitle="Search by operator name."
          trailing={<AppButton title="Add Operator" onPress={() => setIsModalVisible(true)} />}
        />
        <View style={styles.searchPanel}>
          <AppInput placeholder="Search by name..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} />
        </View>
      </View>

      <FlatList
        data={filteredOperators}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedOperator(item)} style={styles.listCard}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.email}</Text>
            <Text style={styles.cardMeta}>{item.phoneNumber}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No operators found</Text>
            <Text style={styles.emptyText}>Create an operator to populate this list.</Text>
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
              <AppInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
              <AppInput placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
            </View>
            <View style={styles.buttonStack}>
              <AppButton title="Add Operator" onPress={addOperator} />
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
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
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

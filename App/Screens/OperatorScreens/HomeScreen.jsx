import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const initialSummary = {
  totalAvailablePetrol: 0,
  totalAvailableDiesel: 0,
  totalTransactions: 0,
  totalLitresDispensed: 0,
};

const qrFuelTypes = new Set(['petrol', 'diesel']);
const qrVehicleTypes = new Set(['car', 'bike', 'truck', 'bus', 'motorcycle', 'motorbike']);

const extractVehicleNumber = (value) => {
  const rawValue = String(value || '').trim();

  if (!rawValue) {
    return '';
  }

  const segments = rawValue
    .split('-')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 3) {
    const fuelType = segments.at(-1)?.toLowerCase();
    const vehicleType = segments.at(-2)?.toLowerCase();

    if (qrFuelTypes.has(fuelType) && qrVehicleTypes.has(vehicleType)) {
      return segments.slice(0, -2).join('-');
    }
  }

  return rawValue;
};

const HomeScreen = () => {
  const { user } = useUser();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrPayload, setQrPayload] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [litresPumped, setLitresPumped] = useState('');
  const [summary, setSummary] = useState(initialSummary);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadSummary = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/fuel/station-summary'), buildMobileRequestConfig(user));

      setSummary({
        totalAvailablePetrol: Number(response.data?.totalAvailablePetrol || 0),
        totalAvailableDiesel: Number(response.data?.totalAvailableDiesel || 0),
        totalTransactions: Number(response.data?.totalTransactions || 0),
        totalLitresDispensed: Number(response.data?.totalLitresDispensed || 0),
      });
    } catch (error) {
      console.error('Error fetching station fuel summary:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load station fuel summary.',
      });
    } finally {
      setIsSummaryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const initialize = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      await loadSummary();
    };

    initialize();
  }, [loadSummary]);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setQrPayload(data);
    setVehicleNumber(extractVehicleNumber(data));
    setFeedback(null);
  };

  const handleReset = ({ keepFeedback = false } = {}) => {
    setScanned(false);
    setQrPayload('');
    setVehicleNumber('');
    setLitresPumped('');

    if (!keepFeedback) {
      setFeedback(null);
    }
  };

  const handleQrPayloadChange = (value) => {
    setQrPayload(value);
    setVehicleNumber(extractVehicleNumber(value));
    setFeedback(null);

    if (!value.trim()) {
      setScanned(false);
    } else {
      setScanned(true);
    }
  };

  const handleLitresChange = (value) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    setLitresPumped(value);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!vehicleNumber.trim()) {
      setFeedback({ type: 'error', message: 'Scan the QR code or enter the vehicle number first.' });
      return;
    }

    if (!litresPumped) {
      setFeedback({ type: 'error', message: 'Enter the litres pumped before recording the transaction.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await axios.post(
        buildApiUrl('/api/fuel/register'),
        {
          vehicleNumber,
          qrData: qrPayload,
          litresPumped,
        },
        buildMobileRequestConfig(user),
      );

      await loadSummary();

      setFeedback({
        type: 'success',
        message: `${response.data?.litresPumped}L of ${response.data?.fuelType} recorded for ${response.data?.vehicleNumber}. Available ${response.data?.fuelType} stock was reduced automatically.`,
      });

      handleReset({ keepFeedback: true });
    } catch (error) {
      console.error('Error registering fuel transaction:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to register the fuel transaction.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  let scannerContent;

  if (hasPermission === null) {
    scannerContent = (
      <View style={styles.messageCard}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  } else if (hasPermission === false) {
    scannerContent = (
      <View style={styles.messageCard}>
        <Text style={[styles.messageText, { color: colors.danger }]}>Camera access is required for QR scanning.</Text>
      </View>
    );
  } else {
    scannerContent = (
      <View style={styles.scannerCard}>
        {!scanned ? (
          <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={styles.scanner} />
        ) : (
          <View style={styles.resultBlock}>
            <Text style={styles.resultLabel}>Last scanned payload</Text>
            <Text style={styles.resultText}>{qrPayload}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScreenShell
      badge="Operator"
      title="QR scan"
      subtitle="Scan the vehicle QR, enter litres pumped, and the station fuel stock will update automatically."
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Scanner" value={scanned ? 'Captured' : 'Ready'} style={styles.metricCard} />
        <MetricCard
          label="Camera"
          value={hasPermission === false ? 'Off' : hasPermission === null ? '...' : 'On'}
          style={styles.metricCard}
        />
        <MetricCard
          label="Petrol Available"
          value={isSummaryLoading ? '...' : `${summary.totalAvailablePetrol}L`}
          style={styles.metricCard}
        />
        <MetricCard
          label="Diesel Available"
          value={isSummaryLoading ? '...' : `${summary.totalAvailableDiesel}L`}
          style={styles.metricCard}
        />
        <MetricCard
          label="Transactions"
          value={isSummaryLoading ? '...' : `${summary.totalTransactions}`}
          style={styles.metricCard}
        />
        <MetricCard
          label="Dispensed"
          value={isSummaryLoading ? '...' : `${summary.totalLitresDispensed}L`}
          style={styles.metricCard}
        />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="QR Scan"
          title="Camera preview"
          subtitle={scanned ? 'QR captured. Review details below before recording fuel.' : 'Scan a vehicle QR code.'}
        />
        {scannerContent}
      </View>

      <View style={styles.formCard}>
        <SectionHeader
          badge="Transaction"
          title="Fuel details"
          subtitle="You can correct the vehicle number before saving if needed."
        />

        <AppInput
          label="QR payload"
          value={qrPayload}
          onChangeText={handleQrPayloadChange}
          placeholder="Scan or paste the QR value"
          multiline
          numberOfLines={3}
          style={styles.multilineInput}
        />

        <AppInput
          label="Vehicle number"
          value={vehicleNumber}
          onChangeText={(value) => {
            setVehicleNumber(value);
            setFeedback(null);
          }}
          placeholder="Vehicle number"
          autoCapitalize="characters"
        />

        <AppInput
          label="Litres pumped"
          value={litresPumped}
          onChangeText={handleLitresChange}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        {feedback ? (
          <View style={[styles.feedbackCard, feedback.type === 'error' ? styles.errorCard : styles.successCard]}>
            <Text style={[styles.feedbackText, feedback.type === 'error' ? styles.errorText : styles.successText]}>
              {feedback.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <AppButton
            title={isSubmitting ? 'Saving...' : 'Record transaction'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.primaryAction}
          />
          <AppButton title="Scan Again" onPress={() => handleReset()} variant="secondary" style={styles.secondaryAction} />
        </View>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: '47%',
  },
  sectionBlock: {
    gap: spacing.md,
  },
  scannerCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceDark,
    ...shadow.md,
  },
  scanner: {
    width: '100%',
    height: 420,
  },
  messageCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  resultBlock: {
    gap: spacing.sm,
    padding: spacing.xl,
  },
  resultLabel: {
    color: 'rgba(248, 250, 252, 0.74)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultText: {
    color: colors.textOnDark,
    fontSize: 16,
    lineHeight: 24,
  },
  formCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    minWidth: 180,
  },
  secondaryAction: {
    flex: 1,
    minWidth: 140,
  },
  feedbackCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  successCard: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(29, 139, 95, 0.16)',
  },
  errorCard: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(220, 76, 63, 0.16)',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.danger,
  },
});

export default HomeScreen;

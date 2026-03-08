import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import { addLocalNotification } from '../../../utils/localNotifications';
import { showUnreadNotificationPopup } from '../../../utils/notificationPopup';
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

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [qrPayload, setQrPayload] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [litresPumped, setLitresPumped] = useState('');
  const [summary, setSummary] = useState(initialSummary);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showStatusToast = useCallback((message, type = 'success') => {
    if (!message) {
      return;
    }

    Alert.alert(type === 'error' ? 'Failed' : 'Success', message);
  }, []);

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
      showStatusToast(error.response?.data?.message || 'Failed to load station fuel summary.', 'error');
    } finally {
      setIsSummaryLoading(false);
    }
  }, [showStatusToast, user]);

  useEffect(() => {
    const initialize = async () => {
      await loadSummary();
    };

    initialize();
  }, [loadSummary]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadNotificationPopup = async () => {
        try {
          if (!isActive) {
            return;
          }

          await showUnreadNotificationPopup(user);
        } catch (notificationError) {
          console.error('Error showing notifications:', notificationError);
        }
      };

      loadNotificationPopup();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) {
      return;
    }

    setScanned(true);
    setIsScannerVisible(false);
    setQrPayload(data);
    setVehicleNumber(extractVehicleNumber(data));
  };

  const handleReset = () => {
    setScanned(false);
    setQrPayload('');
    setVehicleNumber('');
    setLitresPumped('');
  };

  const handleQrPayloadChange = (value) => {
    setQrPayload(value);
    setVehicleNumber(extractVehicleNumber(value));

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
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult?.granted) {
        showStatusToast('Camera permission is required to scan QR codes.', 'error');
        return;
      }
    }

    setScanned(false);
    setIsScannerVisible(true);
  };

  const handleSubmit = async () => {
    if (!vehicleNumber.trim()) {
      showStatusToast('Scan the QR code or enter the vehicle number first.', 'error');
      return;
    }

    if (!litresPumped) {
      showStatusToast('Enter the litres pumped before recording the transaction.', 'error');
      return;
    }

    setIsSubmitting(true);

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

      showStatusToast('Fuel transaction recorded successfully.', 'success');

      await addLocalNotification(user?._id, {
        type: 'fuel_transaction',
        title: 'Fuel transaction recorded',
        message: `${response.data?.litresPumped}L of ${response.data?.fuelType} was recorded for ${response.data?.vehicleNumber} at ${response.data?.stationName}.`,
        status: 'completed',
        vehicle: response.data?.vehicle
          ? {
              _id: response.data.vehicle,
              vehicleNumber: response.data.vehicleNumber,
            }
          : null,
      });

      handleReset();
    } catch (error) {
      console.error('Error registering fuel transaction:', error);
      showStatusToast(error.response?.data?.message || 'Failed to register the fuel transaction.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell
      badge="Operator"
      title="QR scan"
      subtitle="Scan the vehicle QR, enter litres pumped, and the station fuel stock will update automatically."
    >
      <View style={styles.metricGrid}>
        <MetricCard
          label="Petrol Available"
          value={isSummaryLoading ? '...' : `${summary.totalAvailablePetrol}L`}
          tone="accent"
          style={styles.metricCard}
        />
        <MetricCard
          label="Diesel Available"
          value={isSummaryLoading ? '...' : `${summary.totalAvailableDiesel}L`}
          tone="amber"
          style={styles.metricCard}
        />
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
          onChangeText={setVehicleNumber}
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

        <AppButton title="Scan QR" onPress={openScanner} variant="secondary" />

        <View style={styles.actionRow}>
          <AppButton
            title={isSubmitting ? 'Saving...' : 'Record transaction'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.primaryAction}
          />
        </View>
      </View>

      <Modal
        visible={isScannerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <View style={styles.scannerFullScreen}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            style={styles.scannerFullPreview}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeaderCard}>
              <Text style={styles.scannerBadge}>QR Scan</Text>
              <Text style={styles.scannerTitle}>Scan code</Text>
              <Text style={styles.scannerSubtitle}>Align the vehicle QR code inside the frame.</Text>
            </View>
            <AppButton title="Close scanner" variant="secondary" onPress={() => setIsScannerVisible(false)} />
          </View>
        </View>
      </Modal>
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
  scannerFullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerFullPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  scannerHeaderCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  scannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    color: colors.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  scannerTitle: {
    color: colors.textOnDark,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  scannerSubtitle: {
    color: 'rgba(248, 250, 252, 0.88)',
    fontSize: 14,
    lineHeight: 21,
  },
});

export default HomeScreen;

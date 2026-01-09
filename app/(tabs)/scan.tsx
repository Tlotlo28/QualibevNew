import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QrCode, Nfc, X, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '@/lib/supabase';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export default function Scan() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [scanType, setScanType] = useState<'qr' | 'nfc' | 'manual' | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const scannedRef = useRef(false);
  const nfcScanningRef = useRef(false);

  useEffect(() => {
    checkNfcSupport();
    return () => {
      if (nfcScanningRef.current) {
        stopNfcScan();
      }
    };
  }, []);

  const checkNfcSupport = async () => {
    if (Platform.OS === 'web') {
      setNfcSupported(false);
      return;
    }

    try {
      await NfcManager.start();
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);

      if (supported) {
        const enabled = await NfcManager.isEnabled();
        setNfcEnabled(enabled);
      }
    } catch (error) {
      console.error('Error checking NFC support:', error);
      setNfcSupported(false);
    }
  };

  const verifyProduct = async (verificationId: string, scanMethod: string) => {
    try {
      setVerifying(true);

      const { data: product, error } = await supabase
        .from('alcohol_products')
        .select(`
          *,
          brand:brands(name, manufacturer, country_code)
        `)
        .eq('verification_id', verificationId)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        await createScanLog(verificationId, false, scanMethod, null);
        router.push('/result-counterfeit');
        return;
      }

      if (!product) {
        await createScanLog(verificationId, false, scanMethod, null);
        router.push('/result-counterfeit');
        return;
      }

      const { data: previousScans } = await supabase
        .from('verification_logs')
        .select('id')
        .eq('verification_id', verificationId);

      const scanCount = previousScans?.length || 0;
      const maxScans = product.max_scans_allowed || 1;

      if (scanCount >= maxScans) {
        await createScanLog(verificationId, false, scanMethod, product.id, 'exceeded_scan_limit');
        router.push('/result-counterfeit');
        return;
      }

      await createScanLog(verificationId, true, scanMethod, product.id);
      router.push('/result-verified');
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to verify product. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const createScanLog = async (
    verificationId: string,
    isAuthentic: boolean,
    scanMethod: string,
    productId: string | null,
    failureReason?: string
  ) => {
    try {
      await supabase.from('verification_logs').insert({
        verification_id: verificationId,
        product_id: productId,
        scanned_by: user?.id,
        is_authentic: isAuthentic,
        scan_method: scanMethod,
        failure_reason: failureReason || null,
      });

      await supabase.from('scans').insert({
        user_id: user?.id,
        product_name: 'Unknown',
        verification_id: verificationId,
        is_authentic: isAuthentic,
        scan_type: scanMethod,
      });
    } catch (error) {
      console.error('Error creating scan log:', error);
    }
  };

  const handleQRScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
        return;
      }
    }
    scannedRef.current = false;
    setScanType('qr');
    setScanning(true);
  };

  const handleManualEntry = () => {
    setScanType('manual');
    setManualCode('');
  };

  const handleNFCScan = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'NFC Not Available on Web',
        'NFC scanning requires a native iOS or Android device. Please use QR code scanning or manual entry.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!nfcSupported) {
      Alert.alert(
        'NFC Not Supported',
        'Your device does not support NFC scanning. Please use QR code scanning or manual entry.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!nfcEnabled) {
      Alert.alert(
        'NFC Disabled',
        'NFC is disabled on your device. Please enable NFC in your device settings and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setScanType('nfc');
      setScanning(true);
      nfcScanningRef.current = true;

      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();

      if (!nfcScanningRef.current) {
        await NfcManager.cancelTechnologyRequest();
        return;
      }

      nfcScanningRef.current = false;
      setScanning(false);
      setScanType(null);

      let verificationId = '';

      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const textRecord = tag.ndefMessage.find((record: any) => {
          if (record.tnf === Ndef.TNF_WELL_KNOWN) {
            const typeString = Ndef.text.decodePayload(record.payload);
            return typeString;
          }
          return null;
        });

        if (textRecord) {
          verificationId = Ndef.text.decodePayload(textRecord.payload);
        }
      }

      if (!verificationId && tag?.id) {
        verificationId = tag.id;
      }

      await NfcManager.cancelTechnologyRequest();

      if (verificationId) {
        await verifyProduct(verificationId, 'NFC');
      } else {
        Alert.alert('Scan Failed', 'Could not read NFC tag data. Please try again.');
      }
    } catch (error) {
      console.error('NFC scan error:', error);
      nfcScanningRef.current = false;
      setScanning(false);
      setScanType(null);
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      Alert.alert('NFC Error', 'Failed to scan NFC tag. Please try again.');
    }
  };

  const stopNfcScan = async () => {
    try {
      nfcScanningRef.current = false;
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scanning || scannedRef.current) return;

    scannedRef.current = true;
    setScanning(false);
    setScanType(null);

    await verifyProduct(data, 'QR');
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Invalid Input', 'Please enter a verification code');
      return;
    }

    setScanType(null);
    await verifyProduct(manualCode.trim(), 'Manual');
    setManualCode('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={[styles.title, { color: colors.text }]}>Choose Scan Method</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select how you want to verify the product
          </Text>
        </Animated.View>

        <View style={styles.scanOptions}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <TouchableOpacity
              style={[styles.scanCard, { backgroundColor: colors.cardBackground }]}
              onPress={handleQRScan}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#334155' }]}>
                <QrCode size={48} color={colors.primary} />
              </View>
              <Text style={[styles.scanTitle, { color: colors.text }]}>Scan QR Code</Text>
              <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                Use camera to scan QR code on product
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <TouchableOpacity
              style={[styles.scanCard, { backgroundColor: colors.cardBackground }]}
              onPress={handleManualEntry}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#1E3A5F' }]}>
                <KeyboardIcon size={48} color={colors.primary} />
              </View>
              <Text style={[styles.scanTitle, { color: colors.text }]}>Manual Entry</Text>
              <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                Enter verification code manually
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <TouchableOpacity
              style={[styles.scanCard, { backgroundColor: colors.cardBackground }]}
              onPress={handleNFCScan}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#7C2D12' }]}>
                <Nfc size={48} color={colors.primary} />
              </View>
              <Text style={[styles.scanTitle, { color: colors.text }]}>NFC Scan</Text>
              <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                {Platform.OS === 'web'
                  ? 'Tap device to NFC tag (Native only)'
                  : !nfcSupported
                  ? 'NFC not supported on this device'
                  : !nfcEnabled
                  ? 'NFC disabled - Enable in settings'
                  : 'Tap device to NFC tag on product'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <Modal
        visible={scanType === 'qr' && scanning}
        animationType="slide"
        onRequestClose={() => {
          setScanning(false);
          setScanType(null);
          scannedRef.current = false;
        }}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
            }}
          >
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraText}>Align QR code within the frame</Text>
              <View style={styles.scanFrame} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setScanning(false);
                  setScanType(null);
                  scannedRef.current = false;
                }}
              >
                <X size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      <Modal
        visible={scanType === 'manual'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setScanType(null);
          setManualCode('');
        }}
      >
        <View style={styles.manualOverlay}>
          <View style={[styles.manualModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.manualHeader}>
              <Text style={[styles.manualTitle, { color: colors.text }]}>
                Enter Verification Code
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setScanType(null);
                  setManualCode('');
                }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.manualDescription, { color: colors.textSecondary }]}>
              Type the verification code found on the product label (e.g., VRF-XXXX-XXXX-XXXX)
            </Text>

            <TextInput
              style={[
                styles.manualInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="VRF-XXXX-XXXX-XXXX"
              placeholderTextColor={colors.textSecondary}
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleManualSubmit}
            >
              <Text style={styles.submitButtonText}>Verify Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={scanType === 'nfc' && scanning}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          stopNfcScan();
          setScanning(false);
          setScanType(null);
        }}
      >
        <View style={styles.nfcOverlay}>
          <View style={[styles.nfcModal, { backgroundColor: colors.cardBackground }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center' }}>
              <View style={[styles.nfcIconContainer, { backgroundColor: colors.primary }]}>
                <Nfc size={64} color="#FFFFFF" />
              </View>
              <Text style={[styles.nfcTitle, { color: colors.text }]}>
                Ready to Scan
              </Text>
              <Text style={[styles.nfcSubtitle, { color: colors.textSecondary }]}>
                Hold your device near the NFC tag
              </Text>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />

              <TouchableOpacity
                style={[styles.cancelNfcButton, { borderColor: colors.border }]}
                onPress={() => {
                  stopNfcScan();
                  setScanning(false);
                  setScanType(null);
                }}
              >
                <Text style={[styles.cancelNfcText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>

      <Modal visible={verifying} animationType="fade" transparent={true}>
        <View style={styles.verifyingOverlay}>
          <View style={[styles.verifyingModal, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.verifyingText, { color: colors.text }]}>
              Verifying Product...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  scanOptions: {
    gap: spacing.lg,
  },
  scanCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scanTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
  },
  scanDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: '#FFFFFF',
    marginBottom: spacing.xl,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: spacing.sm,
  },
  manualOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  manualModal: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  manualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  manualTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    flex: 1,
  },
  manualDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  manualInput: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  submitButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
  nfcOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  nfcModal: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  nfcIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  nfcTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  nfcSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  cancelNfcButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  cancelNfcText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  verifyingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingModal: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  verifyingText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
  },
});

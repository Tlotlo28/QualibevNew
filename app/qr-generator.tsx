import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ArrowLeft, Download, Sparkles, RefreshCw } from 'lucide-react-native';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { generateSecureVerificationId } from '@/utils/qrCodeGenerator';

export default function QRGeneratorScreen() {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [alcoholType, setAlcoholType] = useState('');
  const [generatedQR, setGeneratedQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const qrRef = useRef<any>(null);

  if (profile?.user_role !== 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Access Denied</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.accessDenied}>
          <Text style={[styles.accessDeniedTitle, { color: colors.error }]}>
            🔒 Admin Access Required
          </Text>
          <Text style={[styles.accessDeniedText, { color: colors.textSecondary }]}>
            This feature is restricted to QualiBev administrators only.{'\n\n'}
            QR codes are generated and sold by QualiBev to manufacturers.
          </Text>
          <TouchableOpacity
            style={[styles.goBackButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.goBackButtonText, { color: colors.white }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const generateNewId = () => {
    const newId = generateSecureVerificationId();
    setVerificationId(newId);
  };

  const createProduct = async () => {
    if (!productName || !brandName || !batchNumber || !alcoholType) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    if (!verificationId) {
      Alert.alert('Error', 'Please generate a verification ID first');
      return;
    }

    try {
      setLoading(true);

      let brandId = null;
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandName)
        .maybeSingle();

      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const { data: newBrand, error: brandError } = await supabase
          .from('brands')
          .insert({
            name: brandName,
            manufacturer: brandName,
            country_code: 'ZA',
            verified: true,
          })
          .select('id')
          .single();

        if (brandError) throw brandError;
        brandId = newBrand.id;
      }

      const { error: productError } = await supabase
        .from('alcohol_products')
        .insert({
          brand_id: brandId,
          product_name: productName,
          verification_id: verificationId,
          batch_number: batchNumber,
          manufacture_date: new Date().toISOString().split('T')[0],
          alcohol_type: alcoholType,
          origin_country: 'ZA',
          is_test_product: true,
          max_scans_allowed: 15,
          qr_code_data: verificationId,
          status: 'active',
          created_by: user?.id || null,
        });

      if (productError) throw productError;

      setGeneratedQR(true);
      Alert.alert('Success!', 'Product created successfully! You can now download the QR code.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Download QR Code',
          'On web: Right-click the QR code below and select "Save image as..."',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!qrRef.current) {
        Alert.alert('Error', 'QR code not available');
        return;
      }

      qrRef.current.toDataURL(async (dataURL: string) => {
        const filename = `${FileSystem.documentDirectory}QR_${verificationId}.png`;
        await FileSystem.writeAsStringAsync(filename, dataURL.split(',')[1], {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filename, {
            mimeType: 'image/png',
            dialogTitle: `QR Code - ${productName}`,
          });
        } else {
          Alert.alert('Success', `QR code saved to: ${filename}`);
        }
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to download QR code');
    }
  };

  const resetForm = () => {
    setProductName('');
    setBrandName('');
    setBatchNumber('');
    setVerificationId('');
    setAlcoholType('');
    setGeneratedQR(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>QR Code Generator</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            🏭 QR Code Generation for Manufacturers
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Generate secure QR codes for alcohol products. Each QR code contains a unique verification ID that links to product authentication data.{'\n\n'}
            1. Enter manufacturer's product details{'\n'}
            2. Generate cryptographically secure verification ID{'\n'}
            3. Create product record and QR code{'\n'}
            4. Download and provide to manufacturer for NFC tag printing
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Details</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Product Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Johnnie Walker Black Label"
              placeholderTextColor={colors.textSecondary}
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Brand Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Johnnie Walker"
              placeholderTextColor={colors.textSecondary}
              value={brandName}
              onChangeText={setBrandName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Batch Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., 6001234567890"
              placeholderTextColor={colors.textSecondary}
              value={batchNumber}
              onChangeText={setBatchNumber}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Alcohol Type *</Text>
            <View style={styles.typeButtons}>
              {['Beer', 'Wine', 'Gin', 'Whisky', 'Vodka', 'Rum'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    alcoholType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setAlcoholType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: alcoholType === type ? colors.white : colors.text },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Verification ID</Text>
            <View style={styles.idContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.idInput,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="VRF-XXXX-XXXX-XXXX"
                placeholderTextColor={colors.textSecondary}
                value={verificationId}
                editable={false}
              />
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: colors.primary }]}
                onPress={generateNewId}
              >
                <Sparkles size={20} color={colors.white} />
                <Text style={[styles.generateButtonText, { color: colors.white }]}>Generate ID</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!generatedQR ? (
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.5 },
              ]}
              onPress={createProduct}
              disabled={loading}
            >
              <Text style={[styles.createButtonText, { color: colors.white }]}>
                {loading ? 'Creating...' : 'Create Product & QR Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qrSection}>
              <Text style={[styles.successTitle, { color: colors.success }]}>
                ✓ Product Created Successfully!
              </Text>

              <View style={[styles.qrWrapper, { backgroundColor: colors.white }]}>
                <QRCode
                  value={verificationId}
                  size={200}
                  color={colors.black}
                  backgroundColor={colors.white}
                  getRef={(ref) => (qrRef.current = ref)}
                />
              </View>

              <Text style={[styles.qrLabel, { color: colors.text }]}>{productName}</Text>
              <Text style={[styles.qrId, { color: colors.textSecondary }]}>{verificationId}</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                  onPress={downloadQRCode}
                >
                  <Download size={20} color={colors.white} />
                  <Text style={[styles.downloadButtonText, { color: colors.white }]}>
                    Download QR Code
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resetButton, { borderColor: colors.border }]}
                  onPress={resetForm}
                >
                  <RefreshCw size={20} color={colors.text} />
                  <Text style={[styles.resetButtonText, { color: colors.text }]}>
                    Create Another
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl + 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    flex: 1,
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  accessDeniedTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  goBackButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  goBackButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  infoTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  typeButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  idContainer: {
    gap: spacing.sm,
  },
  idInput: {
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  generateButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  createButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
  },
  qrSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  successTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
  },
  qrWrapper: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  qrLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
  },
  qrId: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  downloadButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  resetButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
});

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { ArrowLeft, Download, RefreshCw } from 'lucide-react-native';
import { spacing, borderRadius, typography } from '@/constants/theme';

interface Product {
  id: string;
  product_name: string;
  verification_id: string;
  batch_number: string;
  manufacture_date: string;
  alcohol_type: string;
  origin_country: string;
  max_scans_allowed: number;
  scan_count: number;
  status: string;
  brand: {
    name: string;
    manufacturer: string;
  };
}

export default function AdminProductsScreen() {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const qrRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (profile?.user_role !== 'admin') {
      Alert.alert('Access Denied', 'You need QualiBev admin access to view this page.');
      router.back();
      return;
    }
    fetchProducts();
  }, [profile]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alcohol_products')
        .select(`
          *,
          brand:brands(name, manufacturer)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async (productId: string, verificationId: string) => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Download QR Code',
          'On web, please right-click the QR code and save the image.',
          [{ text: 'OK' }]
        );
        return;
      }

      const qrRef = qrRefs.current[productId];
      if (!qrRef) {
        Alert.alert('Error', 'QR code not available');
        return;
      }

      qrRef.toDataURL(async (dataURL: string) => {
        const filename = `${FileSystem.documentDirectory}QR_${verificationId}.png`;
        await FileSystem.writeAsStringAsync(filename, dataURL.split(',')[1], {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filename, {
            mimeType: 'image/png',
            dialogTitle: `QR Code - ${verificationId}`,
          });
        } else {
          Alert.alert('Success', `QR code saved to: ${filename}`);
        }
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to download QR code');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Product QR Codes</Text>
        <TouchableOpacity onPress={fetchProducts} style={styles.refreshButton}>
          <RefreshCw size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            📱 How to Test QR Codes
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. Tap the download button to save QR codes{'\n'}
            2. Display QR code on another device or print it{'\n'}
            3. Use the Scan tab to test verification{'\n'}
            4. Test products allow up to 15 scans
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All Products ({products.length})
        </Text>

        {products.map((product) => (
          <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card }]}>
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.text }]}>
                {product.product_name}
              </Text>
              <Text style={[styles.brandName, { color: colors.textSecondary }]}>
                {product.brand.name}
              </Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Verification ID
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.verification_id}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Batch Number
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.batch_number}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Type
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.alcohol_type}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Scans
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.scan_count} / {product.max_scans_allowed}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.qrContainer}>
              <View style={[styles.qrWrapper, { backgroundColor: colors.white }]}>
                <QRCode
                  value={product.verification_id}
                  size={150}
                  color={colors.black}
                  backgroundColor={colors.white}
                  getRef={(ref) => (qrRefs.current[product.id] = ref)}
                />
              </View>
              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                onPress={() => downloadQRCode(product.id, product.verification_id)}
              >
                <Download size={16} color={colors.white} />
                <Text style={[styles.downloadText, { color: colors.white }]}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {products.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No products found. Add products to generate QR codes.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
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
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: spacing.xs,
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
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
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
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    marginTop: spacing.sm,
  },
  productCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  productInfo: {
    gap: spacing.sm,
  },
  productName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
  },
  brandName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  qrContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  qrWrapper: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  downloadText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
});

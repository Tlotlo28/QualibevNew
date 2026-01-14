import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle, Package, Building2, MapPin, Hash, FileCheck, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentProduct, clearCurrentProduct } from '@/utils/tempProductStore';

export default function ResultVerified() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    loadLatestVerification();
  }, []);

  const loadLatestVerification = async () => {
    try {
      const currentProduct = getCurrentProduct();

      if (currentProduct) {
        setProduct(currentProduct);
        setScanCount(1);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading verification:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>No product data found</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 20 }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={[colors.success, '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successCard}
          >
            <View style={styles.successIcon}>
              <CheckCircle size={80} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.successTitle}>Product Verified!</Text>
            <Text style={styles.successSubtitle}>
              This product is authentic and safe to consume
            </Text>
            {scanCount > 1 && (
              <View style={styles.scanBadge}>
                <Text style={styles.scanBadgeText}>
                  Scanned {scanCount} {scanCount === 1 ? 'time' : 'times'}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Details</Text>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                <Package size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Product Name
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.product_name}
                </Text>
              </View>
            </View>

            {product.brand && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                  <Building2 size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Brand</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.brand.name}
                  </Text>
                </View>
              </View>
            )}

            {product.brand?.manufacturer && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                  <Building2 size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Manufacturer
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.brand.manufacturer}
                  </Text>
                </View>
              </View>
            )}

            {product.origin_country && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Origin</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.origin_country}
                  </Text>
                </View>
              </View>
            )}

            {product.alcohol_type && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                  <Package size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Product Type
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.alcohol_type}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Details</Text>

            {product.batch_number && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                  <Hash size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Batch Number
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.batch_number}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                <FileCheck size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Verification ID
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.verification_id}
                </Text>
              </View>
            </View>

            {product.manufacture_date && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background }]}>
                  <Calendar size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Manufacture Date
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(product.manufacture_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Scan Another</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 60,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
  },
  successCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxxl,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  scanBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  scanBadgeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: '#FFFFFF',
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
});

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { QrCode, Nfc, AlertTriangle, TrendingUp, Bell, Moon, Sun } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({ scans: 0, verified: 0, reports: 0 });
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    loadStats();
    checkNotifications();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const { data: scans } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id);

    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id);

    const verified = scans?.filter((s) => s.is_authentic).length || 0;

    setStats({
      scans: scans?.length || 0,
      verified,
      reports: reports?.length || 0,
    });
  };

  const checkNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false);

    setHasUnreadNotifications((data?.length || 0) > 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Logo size="small" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>QualiBev</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={styles.iconButton}
          >
            <Bell size={24} color={colors.text} />
            {hasUnreadNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {theme === 'light' ? (
              <Moon size={24} color={colors.text} />
            ) : (
              <Sun size={24} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={[colors.primary, '#FF7555']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}
          >
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Ready to scan some awesome products? Let's verify authenticity together!
            </Text>
            <TouchableOpacity
              style={styles.startScanButton}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <QrCode size={20} color={colors.primary} />
              <Text style={[styles.startScanText, { color: colors.primary }]}>Start Scan</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <TouchableOpacity
            style={[styles.reportCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => router.push('/report')}
          >
            <View style={[styles.reportIconContainer, { backgroundColor: '#450A0A' }]}>
              <AlertTriangle size={28} color={colors.primary} />
            </View>
            <View style={styles.reportContent}>
              <Text style={[styles.reportTitle, { color: colors.text }]}>Report Issues</Text>
              <Text style={[styles.reportSubtitle, { color: colors.textSecondary }]}>
                Help us fight fakes!
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
          <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.statsHeader}>
              <TrendingUp size={20} color={colors.gold} />
              <Text style={[styles.statsTitle, { color: colors.text }]}>Your Activity</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.scans}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Products Scanned
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>{stats.verified}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Authentic</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>{stats.reports}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reports</Text>
              </View>
            </View>
          </View>
        </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  welcomeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  welcomeTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
    color: '#FFFFFF',
  },
  welcomeSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  startScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  startScanText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
  },
  section: {
    gap: spacing.md,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scanIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContent: {
    flex: 1,
  },
  scanTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.xs,
  },
  scanSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.xs,
  },
  reportSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  statsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statsTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxxl,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
});

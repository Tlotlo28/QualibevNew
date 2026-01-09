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
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Edit,
  ChevronRight,
  QrCode,
  Sparkles,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '@/components/Logo';

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ scans: 0, verified: 0, reports: 0 });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    setProfile(data);
  };

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

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/edit-profile')}>
          <Edit size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={[colors.primary, '#FF7555']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.avatarContainer}>
              <Logo size="medium" />
            </View>
            <Text style={styles.profileName}>{profile.full_name}</Text>
            <Text style={styles.profileMember}>
              Member since {formatDate(profile.member_since)}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.scans}</Text>
                <Text style={styles.statLabel}>Scans</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.verified}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.reports}</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Personal Information
            </Text>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <Mail size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {profile.location || 'Not set'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Member Since
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(profile.member_since)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/notifications')}
            >
              <View style={styles.menuLeft}>
                <Bell size={22} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.menuLeft}>
                <Settings size={22} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.text }]}>App Settings</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/support')}
            >
              <View style={styles.menuLeft}>
                <HelpCircle size={22} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.text }]}>Support & Help</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={styles.menuLeft}>
                <User size={22} color={colors.primary} />
                <Text style={[styles.menuText, { color: colors.text }]}>Edit Profile</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {profile?.user_role === 'admin' && (
          <Animated.View entering={FadeInDown.delay(350).duration(600)}>
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>QualiBev Admin</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/qr-generator')}
              >
                <View style={styles.menuLeft}>
                  <Sparkles size={22} color={colors.primary} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Generate QR Codes</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/admin-products')}
              >
                <View style={styles.menuLeft}>
                  <QrCode size={22} color={colors.primary} />
                  <Text style={[styles.menuText, { color: colors.text }]}>View All QR Codes</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Sign Out</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  profileCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  profileName: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  profileMember: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statBox: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    opacity: 0.9,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  logoutText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
});

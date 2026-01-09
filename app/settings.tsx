import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import { ArrowLeft, Moon, Sun, Bell, Shield, Globe, ChevronRight } from 'lucide-react-native';

export default function Settings() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>App Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {theme === 'light' ? (
                <Sun size={22} color={colors.primary} />
              ) : (
                <Moon size={22} color={colors.primary} />
              )}
              <Text style={[styles.settingText, { color: colors.text }]}>
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: theme === 'dark' ? colors.primary : colors.border },
              ]}
              onPress={toggleTheme}
            >
              <View
                style={[
                  styles.toggleKnob,
                  { backgroundColor: colors.white },
                  theme === 'dark' && styles.toggleKnobActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={22} color={colors.primary} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive alerts about scan results
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/terms')}
          >
            <View style={styles.settingLeft}>
              <Shield size={22} color={colors.primary} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Data Privacy</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  View Terms & Conditions and POPI Act
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Globe size={22} color={colors.primary} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Version</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Quality Bev v1.0.0
                </Text>
              </View>
            </View>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  settingDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});

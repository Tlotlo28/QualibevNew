import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import { ArrowLeft, Mail, MessageCircle, FileText, ExternalLink } from 'lucide-react-native';

export default function Support() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleEmail = () => {
    Linking.openURL('mailto:support@qualitybev.com');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Support & Help</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Get Help</Text>

          <TouchableOpacity style={styles.helpItem} onPress={handleEmail}>
            <View style={[styles.helpIcon, { backgroundColor: colors.background }]}>
              <Mail size={24} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>Email Support</Text>
              <Text style={[styles.helpDescription, { color: colors.textSecondary }]}>
                support@qualitybev.com
              </Text>
            </View>
            <ExternalLink size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.helpItem}>
            <View style={[styles.helpIcon, { backgroundColor: colors.background }]}>
              <MessageCircle size={24} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>Live Chat</Text>
              <Text style={[styles.helpDescription, { color: colors.textSecondary }]}>
                Chat with our support team
              </Text>
            </View>
          </View>

          <View style={styles.helpItem}>
            <View style={[styles.helpIcon, { backgroundColor: colors.background }]}>
              <FileText size={24} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>FAQs</Text>
              <Text style={[styles.helpDescription, { color: colors.textSecondary }]}>
                Find answers to common questions
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              How does the verification work?
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              Our app uses QR codes and NFC tags to verify product authenticity against blockchain
              records and manufacturer databases.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              What should I do if I find a counterfeit?
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              Do not consume the product. Report it through our app and contact local authorities
              or the brand manufacturer.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              Is my data secure?
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              Yes, we use industry-standard encryption to protect your data. We never share your
              personal information without your consent.
            </Text>
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
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.sm,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    marginBottom: 2,
  },
  helpDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  faqItem: {
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  faqQuestion: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  faqAnswer: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});

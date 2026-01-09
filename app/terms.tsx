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
import { ArrowLeft } from 'lucide-react-native';

export default function Terms() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Terms & Conditions
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Welcome to QualiBev
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            By using the QualiBev application, you agree to these terms and conditions.
            Please read them carefully.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            By accessing and using QualiBev, you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to these terms, please do
            not use our service.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Use of Service
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            QualiBev provides a product verification service using QR code and NFC
            technology. You agree to use this service only for lawful purposes and in
            accordance with these Terms and Conditions.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You are responsible for maintaining the confidentiality of your account and
            password. You agree to accept responsibility for all activities that occur
            under your account.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Privacy & Data Protection (POPI Act Compliance)
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            QualiBev is committed to protecting your personal information in accordance
            with the Protection of Personal Information Act, Act 4 of 2013 (POPI Act).
          </Text>

          <Text style={[styles.subTitle, { color: colors.text }]}>
            4.1 Information We Collect
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We collect personal information that you provide to us, including but not
            limited to your name, email address, and location. We also collect information
            about your product scans and verification history.
          </Text>

          <Text style={[styles.subTitle, { color: colors.text }]}>
            4.2 How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Your personal information is used to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Provide and maintain our service
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Verify product authenticity
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Send you notifications about your scans and reports
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Improve our services and user experience
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Comply with legal obligations
          </Text>

          <Text style={[styles.subTitle, { color: colors.text }]}>
            4.3 Data Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We implement appropriate technical and organizational security measures to
            protect your personal information against unauthorized access, alteration,
            disclosure, or destruction.
          </Text>

          <Text style={[styles.subTitle, { color: colors.text }]}>
            4.4 Your Rights Under POPI Act
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Under the POPI Act, you have the right to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Access your personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Request correction of inaccurate information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Object to processing of your information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Request deletion of your information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Lodge a complaint with the Information Regulator
          </Text>

          <Text style={[styles.subTitle, { color: colors.text }]}>
            4.5 Data Retention
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We retain your personal information only for as long as necessary to fulfill
            the purposes for which it was collected, including legal, accounting, or
            reporting requirements.
          </Text>

          <Text style={[styles.subTitle, { color: colors.text }]}>
            4.6 Third-Party Disclosure
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We do not sell, trade, or otherwise transfer your personal information to
            third parties without your consent, except as required by law or to protect
            our rights.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Product Verification
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            While we strive to provide accurate product verification, QualiBev does not
            guarantee the authenticity of products. Verification results should be used
            as guidance only.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Limitation of Liability
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            QualiBev shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages resulting from your use or inability to
            use the service.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Changes to Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We reserve the right to modify these terms at any time. Changes will be
            effective immediately upon posting to the application. Your continued use
            of the service constitutes acceptance of modified terms.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Contact Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            If you have any questions about these Terms and Conditions or wish to
            exercise your rights under the POPI Act, please contact us through the
            Support & Help section in the app.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Governing Law
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            These Terms and Conditions shall be governed by and construed in accordance
            with the laws of South Africa, including the Protection of Personal
            Information Act, Act 4 of 2013.
          </Text>
        </View>

        <View style={[styles.footer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Last Updated: January 2026
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            QualiBev © 2026
          </Text>
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
    gap: spacing.md,
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
    marginBottom: spacing.sm,
  },
  subTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  paragraph: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
    marginLeft: spacing.sm,
  },
  footer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
});

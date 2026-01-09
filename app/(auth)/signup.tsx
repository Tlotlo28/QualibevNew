import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, Moon, Sun } from 'lucide-react-native';
import { Logo } from '@/components/Logo';

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedBottle, setSelectedBottle] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bottles = [
    { emoji: '🍾', name: 'Champagne', isReal: true },
    { emoji: '🍷', name: 'Wine', isReal: true },
    { emoji: '🍺', name: 'Beer', isReal: true },
    { emoji: '🧃', name: 'Juice Box', isReal: false },
    { emoji: '🥤', name: 'Soda', isReal: false },
    { emoji: '🧪', name: 'Chemical', isReal: false },
  ];

  const handleSignUp = async () => {
    setError('');
    setLoading(true);

    if (!fullName || !email || !password || !confirmPassword || !selectedBottle) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const selectedBottleData = bottles.find((b) => b.emoji === selectedBottle);
    if (!selectedBottleData?.isReal) {
      setError('Oops! That\'s not alcohol. Try selecting a real beverage!');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        {theme === 'light' ? (
          <Moon size={24} color={colors.text} />
        ) : (
          <Sun size={24} color={colors.text} />
        )}
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.logoContainer}
        >
          <Logo size="medium" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.card, { backgroundColor: colors.cardBackground }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join us in fighting counterfeit products
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View style={styles.captchaContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Fun Check: Which one is alcohol? 🍾
              </Text>
              <Text style={[styles.captchaHint, { color: colors.textSecondary }]}>
                Tap the beverage that contains alcohol
              </Text>
              <View style={styles.bottlesGrid}>
                {bottles.map((bottle) => (
                  <TouchableOpacity
                    key={bottle.emoji}
                    style={[
                      styles.bottleButton,
                      {
                        backgroundColor: colors.background,
                        borderColor:
                          selectedBottle === bottle.emoji ? colors.primary : colors.border,
                        borderWidth: selectedBottle === bottle.emoji ? 3 : 1,
                      },
                    ]}
                    onPress={() => setSelectedBottle(bottle.emoji)}
                  >
                    <Text style={styles.bottleEmoji}>{bottle.emoji}</Text>
                    <Text style={[styles.bottleName, { color: colors.text }]}>
                      {bottle.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.border,
                    backgroundColor: agreedToTerms ? colors.primary : 'transparent',
                  },
                ]}
              >
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                I agree to the{' '}
                <Text
                  style={{ color: colors.primary }}
                  onPress={() => setShowTerms(true)}
                >
                  Terms and Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createAccount}>
              <Text style={[styles.createAccountText, { color: colors.text }]}>
                Already have an account?{' '}
                <Text
                  style={{ color: colors.primary }}
                  onPress={() => router.push('/(auth)/login')}
                >
                  Login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showTerms}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Terms and Conditions
              </Text>
              <TouchableOpacity onPress={() => setShowTerms(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                Welcome to Quality Bev Smart Authentication!{'\n\n'}
                By using this app, you agree to:{'\n\n'}
                1. Provide accurate information during registration{'\n\n'}
                2. Use the app responsibly to verify product authenticity{'\n\n'}
                3. Report counterfeit products when discovered{'\n\n'}
                4. Not misuse the verification system{'\n\n'}
                5. Respect the privacy of other users{'\n\n'}
                6. Follow all applicable laws and regulations{'\n\n'}
                We are committed to protecting consumers from counterfeit alcohol products
                and building trust in verified brands.{'\n\n'}
                Your data will be handled according to our Privacy Policy.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowTerms(false)}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
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
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxxl,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  captchaContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  captchaHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
  bottlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bottleButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  bottleEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  bottleName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  checkboxText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  error: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: '#EF4444',
    textAlign: 'center',
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
  createAccount: {
    marginTop: spacing.sm,
  },
  createAccountText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    width: '100%',
    maxHeight: '80%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
  },
  modalBody: {
    maxHeight: 400,
  },
  modalText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
  modalButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
});

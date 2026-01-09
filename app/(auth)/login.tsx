import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Moon, Sun, ShieldCheck } from 'lucide-react-native';
import { Logo } from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

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
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Let's verify some awesome products
          </Text>

          <View style={styles.form}>
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

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                setError('');
                router.push('/(auth)/forgot-password');
              }}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createAccount}>
              <Text style={[styles.createAccountText, { color: colors.text }]}>
                New here?{' '}
                <Text
                  style={{ color: colors.primary }}
                  onPress={() => router.push('/(auth)/signup')}
                >
                  Create an account
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.footer}
        >
          <ShieldCheck size={20} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Verify authenticity with confidence
          </Text>
        </Animated.View>
      </ScrollView>
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
  forgotPassword: {
    marginTop: spacing.sm,
  },
  forgotPasswordText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  createAccount: {
    marginTop: spacing.sm,
  },
  createAccountText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
});

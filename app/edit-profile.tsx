import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function EditProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name || '');
      setLocation(data.location || '');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!fullName) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        location: location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user?.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1000);
    }

    setLoading(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(true);

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setTimeout(() => {
        setShowPasswordFields(false);
        setPasswordSuccess(false);
      }, 2000);
    }

    setPasswordLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.inputGroup}>
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
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Location</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your location"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>Profile updated successfully!</Text> : null}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.passwordSection, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity
            style={styles.passwordHeader}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
          >
            <View style={styles.passwordHeaderLeft}>
              <Lock size={20} color={colors.primary} />
              <Text style={[styles.passwordTitle, { color: colors.text }]}>
                Change Password
              </Text>
            </View>
            <Text style={[styles.passwordToggle, { color: colors.primary }]}>
              {showPasswordFields ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>

          {showPasswordFields && (
            <View style={styles.passwordForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
              {passwordSuccess ? (
                <Text style={styles.success}>Password changed successfully!</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                <Text style={styles.saveButtonText}>
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
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
  },
  form: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
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
  success: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: '#10B981',
    textAlign: 'center',
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
  passwordSection: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  passwordTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  passwordToggle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  passwordForm: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
});

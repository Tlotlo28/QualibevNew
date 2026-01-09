import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function Notifications() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    loadNotifications();
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          contentContainerStyle={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.notificationItem,
                {
                  backgroundColor: item.read ? colors.cardBackground : colors.primary + '10',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => markAsRead(item.id)}
            >
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                  {item.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
              {!item.read && (
                <View style={styles.unreadDot}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
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
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  notificationContent: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
  },
  notificationMessage: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  notificationTime: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
  unreadDot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.lg,
  },
});

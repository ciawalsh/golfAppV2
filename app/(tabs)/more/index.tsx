import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useRounds } from '@/hooks/useRounds';
import { FallbackImage } from '@/components/FallbackImage';
import { SettingsGroup } from '@/components/SettingsGroup';
import { SettingsRow } from '@/components/SettingsRow';

function formatMemberSince(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp === 0) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function MoreScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const { rounds } = useRounds();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Not Yet Available',
              'Account deletion will be available in a future update. Please contact support for assistance.',
            );
          },
        },
      ],
    );
  };

  const handleSubscription = () => {
    Alert.alert(
      'Coming Soon',
      'Subscription management will be available soon.',
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Coming Soon',
      'Notification preferences will be available soon.',
    );
  };

  const openTerms = () => {
    WebBrowser.openBrowserAsync('https://sweetspotgolf.app/terms');
  };

  const openPrivacy = () => {
    WebBrowser.openBrowserAsync('https://sweetspotgolf.app/privacy');
  };

  const completedRounds = rounds.filter((r) => !r.inProgress).length;
  const memberSince = formatMemberSince(user?.createdAt ?? 0);
  const subscriptionLabel =
    user?.subscription?.tier === 'premium_monthly'
      ? 'Premium Monthly'
      : user?.subscription?.tier === 'premium_annual'
        ? 'Premium Annual'
        : 'Free';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <FallbackImage
              uri={user?.photoURL ?? undefined}
              fallbackIcon="account"
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.displayName} numberOfLines={1}>
                {user?.displayName || 'Golfer'}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {user?.email ?? ''}
              </Text>
              <View style={styles.badgeRow}>
                {user?.handicap != null && Number.isFinite(user.handicap) ? (
                  <View style={styles.handicapBadge}>
                    <Text style={styles.handicapText}>HCP {user.handicap}</Text>
                  </View>
                ) : null}
                {user?.homeCourse ? (
                  <Text style={styles.homeCourse} numberOfLines={1}>
                    {user.homeCourse}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => router.push('/(tabs)/more/edit-profile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedRounds}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user?.handicap != null && Number.isFinite(user.handicap)
                ? String(user.handicap)
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Handicap</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memberSince || '--'}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Settings Groups */}
        <SettingsGroup title="Account">
          <SettingsRow
            icon="crown"
            label="Subscription"
            value={subscriptionLabel}
            onPress={handleSubscription}
          />
        </SettingsGroup>

        <SettingsGroup title="Preferences">
          <SettingsRow
            icon="bell-outline"
            label="Notifications"
            onPress={handleNotifications}
          />
        </SettingsGroup>

        <SettingsGroup title="About">
          <SettingsRow
            icon="file-document-outline"
            label="Terms of Service"
            onPress={openTerms}
          />
          <SettingsRow
            icon="shield-lock-outline"
            label="Privacy Policy"
            onPress={openPrivacy}
          />
          <SettingsRow
            icon="information-outline"
            label="Version"
            value="1.0.0"
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon="logout" label="Sign Out" onPress={handleSignOut} />
          <SettingsRow
            icon="delete-outline"
            label="Delete Account"
            destructive
            onPress={handleDeleteAccount}
          />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.settingsBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  handicapBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  handicapText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '600',
  },
  homeCourse: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  editButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
});

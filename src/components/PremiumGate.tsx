import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface PremiumGateProps {
  children: React.ReactNode;
}

export function PremiumGate({ children }: PremiumGateProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    // Sprint 3 will build the subscription/paywall screen
    router.push('/(tabs)/more');
  };

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.overlay}>
        <MaterialCommunityIcons
          name="lock"
          size={32}
          color={colors.premiumGold}
        />
        <Text style={styles.title}>Premium Content</Text>
        <Text style={styles.subtitle}>
          Subscribe to unlock all video courses and features
        </Text>
        <Pressable style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Upgrade to Premium</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.premiumOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textLight,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.grey300,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.premiumGold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.primary,
  },
});

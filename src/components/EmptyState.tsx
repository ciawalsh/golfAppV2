import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
}

export function EmptyState({
  icon = 'information-outline',
  title,
  subtitle,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={48} color={colors.grey400} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

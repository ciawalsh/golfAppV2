import { Pressable, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SettingsRowProps {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: SettingsRowProps) {
  return (
    <Pressable style={styles.container} onPress={onPress} disabled={!onPress}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={destructive ? colors.error : colors.textSecondary}
      />
      <Text
        style={[styles.label, destructive && styles.destructiveLabel]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={colors.grey400}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    minHeight: 48,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  destructiveLabel: {
    color: colors.error,
  },
  value: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});

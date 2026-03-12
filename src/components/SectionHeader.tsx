import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  const childArray = React.Children.toArray(children);

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childArray.length - 1 ? (
              <View style={styles.divider} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 22 + spacing.md, // icon width + gap
  },
});

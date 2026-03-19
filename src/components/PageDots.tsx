import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface PageDotsProps {
  count: number;
  activeIndex: number;
}

export const PageDots = React.memo(function PageDots({
  count,
  activeIndex,
}: PageDotsProps) {
  if (count <= 1) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIndex ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    borderRadius: 4,
  },
  active: {
    width: 8,
    height: 8,
    backgroundColor: colors.textPrimary,
    opacity: 1,
  },
  inactive: {
    width: 6,
    height: 6,
    backgroundColor: colors.textTertiary,
    opacity: 1,
  },
});

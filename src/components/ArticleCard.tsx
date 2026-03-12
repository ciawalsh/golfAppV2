import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FallbackImage } from '@/components/FallbackImage';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface ArticleCardProps {
  title: string;
  imageUrl?: string;
  date?: string;
  source?: string;
  description?: string;
  onPress: () => void;
}

export const ArticleCard = React.memo(function ArticleCard({
  title,
  imageUrl,
  date,
  source,
  description,
  onPress,
}: ArticleCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <FallbackImage
        uri={imageUrl}
        style={styles.image}
        resizeMode="cover"
        fallbackIcon="newspaper-variant"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={styles.meta}>
          {source ? <Text style={styles.source}>{source}</Text> : null}
          {source && date ? <Text style={styles.dot}> · </Text> : null}
          {date ? <Text style={styles.date}>{date}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  source: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  dot: {
    ...typography.caption,
    color: colors.textMuted,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

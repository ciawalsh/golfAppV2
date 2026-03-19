import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { GenreCard } from '@/components/GenreCard';
import { spacing } from '@/constants/spacing';
import { VideoGenre } from '@/types';

interface TipRowProps {
  title: string;
  genres: VideoGenre[];
  onGenrePress: (genre: VideoGenre) => void;
  onSeeAll?: () => void;
  locked?: boolean;
}

export function TipRow({
  title,
  genres,
  onGenrePress,
  onSeeAll,
  locked = false,
}: TipRowProps) {
  const renderItem = useCallback(
    ({ item }: { item: VideoGenre }) => (
      <GenreCard
        genre={item}
        onPress={() => onGenrePress(item)}
        locked={locked}
      />
    ),
    [onGenrePress, locked],
  );

  if (genres.length === 0) return null;

  return (
    <>
      <SectionHeader title={title} onSeeAll={onSeeAll} />
      <FlatList
        data={genres}
        keyExtractor={(item) => item.type}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
  },
});

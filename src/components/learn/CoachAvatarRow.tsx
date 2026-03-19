import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { CoachAvatar } from '@/components/CoachAvatar';
import { spacing } from '@/constants/spacing';
import { Coach } from '@/types';

interface CoachAvatarRowProps {
  coaches: Coach[];
  onCoachPress: (coach: Coach) => void;
}

export function CoachAvatarRow({ coaches, onCoachPress }: CoachAvatarRowProps) {
  const renderItem = useCallback(
    ({ item }: { item: Coach }) => (
      <CoachAvatar coach={item} onPress={() => onCoachPress(item)} />
    ),
    [onCoachPress],
  );

  return (
    <>
      <SectionHeader title="Your Coaches" />
      <FlatList
        data={coaches}
        keyExtractor={(item) => item.id}
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

import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { CourseCard, COURSE_CARD_WIDTH } from '@/components/CourseCard';
import { spacing } from '@/constants/spacing';
import { CourseWithImage } from '@/hooks/useAllCourses';

interface CourseRowProps {
  courses: CourseWithImage[];
  isFreeTier: boolean;
  onCoursePress: (course: CourseWithImage) => void;
}

export function CourseRow({
  courses,
  isFreeTier,
  onCoursePress,
}: CourseRowProps) {
  const renderItem = useCallback(
    ({ item }: { item: CourseWithImage }) => (
      <CourseCard
        title={item.title}
        image={item.displayImage}
        lessonCount={item.videos.length}
        coachName={item.coachName}
        coachProfilePic={item.coachProfilePic}
        locked={isFreeTier && item.minTierLevel > 1}
        onPress={() => onCoursePress(item)}
      />
    ),
    [isFreeTier, onCoursePress],
  );

  if (courses.length === 0) return null;

  return (
    <>
      <SectionHeader title="Courses" />
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={COURSE_CARD_WIDTH + spacing.md}
        decelerationRate="fast"
      />
      {/* TODO: Sprint 5 — auto-play muted video preview on focused card */}
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
  },
});

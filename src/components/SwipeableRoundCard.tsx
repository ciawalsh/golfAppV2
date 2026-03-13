import { useCallback } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Round } from '@/types/golf';
import { RoundCard } from '@/components/RoundCard';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface SwipeableRoundCardProps {
  round: Round;
  onPress: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function SwipeableRoundCard({
  round,
  onPress,
  onDelete,
  isDeleting = false,
}: SwipeableRoundCardProps) {
  const renderRightActions = useCallback(
    () => (
      <View style={styles.actionsContainer}>
        <Pressable
          style={[
            styles.deleteAction,
            isDeleting && styles.deleteActionDisabled,
          ]}
          onPress={onDelete}
          disabled={isDeleting}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color={colors.textLight}
          />
          <Text style={styles.deleteText}>
            {isDeleting ? 'Deleting' : 'Delete'}
          </Text>
        </Pressable>
      </View>
    ),
    [isDeleting, onDelete],
  );

  return (
    <Swipeable overshootRight={false} renderRightActions={renderRightActions}>
      <RoundCard round={round} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },
  deleteAction: {
    width: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  deleteActionDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '700',
  },
});

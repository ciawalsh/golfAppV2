import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface CommentInputProps {
  onSend: (text: string) => void;
  isPending: boolean;
}

export function CommentInput({ onSend, isPending }: CommentInputProps) {
  const [text, setText] = useState('');

  const canSend = text.trim().length > 0 && !isPending;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    onSend(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Write a comment..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={1000}
        editable={!isPending}
      />
      <Pressable
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        hitSlop={8}
      >
        <MaterialCommunityIcons
          name="send"
          size={22}
          color={canSend ? colors.accent : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separatorLight,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

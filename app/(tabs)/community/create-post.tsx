import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCreatePost } from '@/hooks/useCommunityMutations';
import { useAuthStore } from '@/stores/authStore';
import { FallbackImage } from '@/components/FallbackImage';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius, SCREEN_WIDTH } from '@/constants/spacing';

const MAX_CHARACTERS = 500;
const IMAGE_PREVIEW_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const IMAGE_PREVIEW_HEIGHT = IMAGE_PREVIEW_WIDTH * 0.6;

export default function CreatePostScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createPost = useCreatePost();

  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const canPost = text.trim().length > 0 && !createPost.isPending;
  const remainingChars = MAX_CHARACTERS - text.length;

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageUri(null);
  }, []);

  const handlePost = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText || createPost.isPending) return;

    createPost.mutate(
      { text: trimmedText, imageUri },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to create post. Please try again.');
        },
      },
    );
  }, [text, imageUri, createPost, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={router.back} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        <Pressable onPress={handlePost} disabled={!canPost} hitSlop={8}>
          <Text
            style={[
              styles.postButtonText,
              !canPost && styles.postButtonDisabled,
            ]}
          >
            Post
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userRow}>
          <FallbackImage
            uri={user?.photoURL ?? undefined}
            style={styles.avatar}
            fallbackIcon="account"
          />
          <Text style={styles.userName} numberOfLines={1}>
            {user?.displayName ?? 'Anonymous'}
          </Text>
        </View>

        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          maxLength={MAX_CHARACTERS}
          editable={!createPost.isPending}
          textAlignVertical="top"
        />

        <View style={styles.charCountRow}>
          <Text
            style={[
              styles.charCount,
              remainingChars <= 50 && styles.charCountWarning,
              remainingChars <= 0 && styles.charCountError,
            ]}
          >
            {remainingChars}
          </Text>
        </View>

        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <Pressable
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={28}
                color={colors.surface}
              />
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={styles.imagePickerButton}
          onPress={handlePickImage}
          disabled={createPost.isPending}
        >
          <MaterialCommunityIcons
            name="image-plus"
            size={24}
            color={colors.secondary}
          />
          <Text style={styles.imagePickerText}>Add Photo</Text>
        </Pressable>
      </ScrollView>

      {createPost.isPending ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.loadingText}>Posting...</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  postButtonText: {
    ...typography.button,
    color: colors.secondary,
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey200,
  },
  userName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  charCountWarning: {
    color: colors.warning,
  },
  charCountError: {
    color: colors.error,
  },
  imagePreviewContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  imagePreview: {
    width: IMAGE_PREVIEW_WIDTH,
    height: IMAGE_PREVIEW_HEIGHT,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grey200,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  imagePickerText: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

import { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { FallbackImage } from '@/components/FallbackImage';
import { LoadingSpinner } from '@/components/LoadingIndicator';

function validateHandicap(value: string): number | null {
  if (value.trim() === '') return null;
  const num = parseFloat(value);
  if (!Number.isFinite(num)) return null;
  if (num < 0 || num > 54) return null;
  return Math.round(num * 10) / 10;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [handicapText, setHandicapText] = useState(
    user?.handicap != null && Number.isFinite(user.handicap)
      ? String(user.handicap)
      : '',
  );
  const [homeCourse, setHomeCourse] = useState(user?.homeCourse ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [handicapError, setHandicapError] = useState<string | null>(null);

  const previewAvatar = avatarUri ?? user?.photoURL ?? undefined;

  const hasChanges = useMemo(() => {
    if (avatarUri) return true;
    if (displayName !== (user?.displayName ?? '')) return true;
    const currentHandicapStr =
      user?.handicap != null && Number.isFinite(user.handicap)
        ? String(user.handicap)
        : '';
    if (handicapText !== currentHandicapStr) return true;
    if (homeCourse !== (user?.homeCourse ?? '')) return true;
    return false;
  }, [displayName, handicapText, homeCourse, avatarUri, user]);

  const canSave = hasChanges && !updateProfile.isPending && !handicapError;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleHandicapChange = (value: string) => {
    setHandicapText(value);
    if (value.trim() === '') {
      setHandicapError(null);
      return;
    }
    const num = parseFloat(value);
    if (!Number.isFinite(num) || num < 0 || num > 54) {
      setHandicapError('Handicap must be between 0 and 54');
    } else {
      setHandicapError(null);
    }
  };

  const handleSave = () => {
    if (!canSave) return;

    const handicapValue = validateHandicap(handicapText);
    // If user typed something invalid, don't save
    if (handicapText.trim() !== '' && handicapValue === null) {
      setHandicapError('Handicap must be between 0 and 54');
      return;
    }

    updateProfile.mutate(
      {
        displayName: displayName.trim() || undefined,
        handicap: handicapText.trim() === '' ? null : handicapValue,
        homeCourse: homeCourse.trim() || null,
        avatarUri,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (err) => {
          Alert.alert(
            'Update Failed',
            err instanceof Error ? err.message : 'Could not update profile.',
          );
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={!canSave} hitSlop={8}>
          {updateProfile.isPending ? (
            <LoadingSpinner size={20} />
          ) : (
            <Text
              style={[styles.saveText, !canSave && styles.saveTextDisabled]}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <Pressable style={styles.avatarSection} onPress={handlePickImage}>
            <View style={styles.avatarWrapper}>
              <FallbackImage
                uri={previewAvatar}
                fallbackIcon="account"
                style={styles.avatar}
              />
              <View style={styles.cameraOverlay}>
                <MaterialCommunityIcons
                  name="camera"
                  size={16}
                  color={colors.textLight}
                />
              </View>
            </View>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Pressable>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Handicap</Text>
            <TextInput
              style={[
                styles.textInput,
                handicapError ? styles.inputError : null,
              ]}
              value={handicapText}
              onChangeText={handleHandicapChange}
              placeholder="e.g. 18.5"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={4}
            />
            {handicapError ? (
              <Text style={styles.errorText}>{handicapError}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Home Course</Text>
            <TextInput
              style={styles.textInput}
              value={homeCourse}
              onChangeText={setHomeCourse}
              placeholder="e.g. Royal Birkdale"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              maxLength={100}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.settingsBackground,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  saveText: {
    ...typography.button,
    color: colors.secondary,
  },
  saveTextDisabled: {
    color: colors.textMuted,
  },
  scrollContent: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  changePhotoText: {
    ...typography.bodySmall,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

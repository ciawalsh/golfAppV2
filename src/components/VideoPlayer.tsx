/**
 * VideoPlayer component using expo-video (SDK 55+).
 *
 * Decision: expo-video chosen over expo-av because expo-av is deprecated
 * and removed in SDK 55. expo-video provides a simpler API via useVideoPlayer
 * hook, better performance, and native player controls.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/video/
 */
import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, AppState } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { resolveStorageUrl, clearUrlCache } from '@/services/storageUrl';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  coachName?: string;
  onClose: () => void;
}

export function VideoPlayer({
  videoUrl,
  title,
  coachName,
  onClose,
}: VideoPlayerProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [resolveError, setResolveError] = useState(false);
  const isMountedRef = useRef(true);

  // Resolve gs:// URLs on mount
  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    async function resolve() {
      try {
        const url = await resolveStorageUrl(videoUrl);
        if (!cancelled && isMountedRef.current) {
          if (url) {
            setResolvedUrl(url);
          } else {
            setResolveError(true);
          }
        }
      } catch {
        if (!cancelled && isMountedRef.current) {
          setResolveError(true);
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsResolving(false);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [videoUrl]);

  const handleRetry = useCallback(() => {
    setResolveError(false);
    setIsResolving(true);
    setResolvedUrl(null);
    // Clear cache so we get a fresh URL from the SDK
    clearUrlCache();
    resolveStorageUrl(videoUrl).then((url) => {
      if (isMountedRef.current) {
        if (url) {
          setResolvedUrl(url);
        } else {
          setResolveError(true);
        }
        setIsResolving(false);
      }
    });
  }, [videoUrl]);

  if (isResolving) {
    return (
      <View style={styles.container}>
        <Header title={title} coachName={coachName} onClose={onClose} />
        <View style={styles.centered}>
          <LoadingSpinner size={48} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }

  if (resolveError || !resolvedUrl) {
    return (
      <View style={styles.container}>
        <Header title={title} coachName={coachName} onClose={onClose} />
        <ErrorState
          message="Failed to load video. Please try again."
          onRetry={handleRetry}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={title} coachName={coachName} onClose={onClose} />
      <PlayerView url={resolvedUrl} />
    </View>
  );
}

function Header({
  title,
  coachName,
  onClose,
}: {
  title: string;
  coachName?: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
        <MaterialCommunityIcons
          name="close"
          size={24}
          color={colors.textLight}
        />
      </Pressable>
      <View style={styles.headerInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {coachName ? (
          <Text style={styles.coachName} numberOfLines={1}>
            {coachName}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function PlayerView({ url }: { url: string }) {
  // Use VideoSourceObject so AVPlayer gets a content-type hint for
  // Firebase Storage URLs that lack a file extension.
  const source = useMemo(
    () => ({ uri: url, contentType: 'auto' as const }),
    [url],
  );

  const player = useVideoPlayer(source, (p) => {
    p.play();
  });

  // Pause on background, resume on foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        player.play();
      } else {
        player.pause();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return (
    <View style={styles.playerContainer}>
      <VideoView
        player={player}
        style={styles.player}
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.videoPlayerBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    ...typography.body,
    color: colors.textLight,
    fontWeight: '600',
  },
  coachName: {
    ...typography.caption,
    color: colors.grey400,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.grey400,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
});
